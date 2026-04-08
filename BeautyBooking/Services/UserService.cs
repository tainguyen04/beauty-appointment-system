using AutoMapper;
using AutoMapper.QueryableExtensions;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using BeautyBooking.MappingProfiles;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BeautyBooking.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;
        private readonly IStaffProfileService _staffProfileService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPhotoService _photoService;
        private readonly ApplicationDbContext _dbContext;
        public UserService(IUserRepository userRepo, IMapper mapper, 
            IStaffProfileService staffProfileService,ApplicationDbContext dbContext, 
            ICurrentUserService currentUserService, IPhotoService photoService)
        {
            _userRepo = userRepo;   
            _mapper = mapper;
            _staffProfileService = staffProfileService;
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _photoService = photoService;
        }

        public async Task<bool> BlockAccountAsync(int id)
        {
            var currentUserId = _currentUserService.UserId;
            if(!currentUserId.HasValue)
                throw new UnauthorizedAccessException("Người dùng chưa đăng nhập.");
            var user = await _userRepo.GetByIdAsync(currentUserId.Value);
            if (user == null || user.IsDeleted)
                throw new KeyNotFoundException("Tài khoản không tồn tại.");
            user.IsActived = false;
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeMyPasswordAsync(ChangePasswordRequest request)
        {
            var userId = _currentUserService.UserId;
            if(!userId.HasValue)
                throw new InvalidOperationException("Không tìm thấy người dùng.");
            var currentUserId = userId.Value;
            if (currentUserId <= 0)
                throw new InvalidOperationException("Không tìm thấy User.");
            var user = await _userRepo.GetByIdAsync(currentUserId);
            if (user == null || user.IsDeleted)
                throw new InvalidOperationException("User không tồn tại.");
            if(!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                throw new InvalidOperationException("Mật khẩu cũ không chính xác");
            var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordHash = newHashedPassword;
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeRoleAsync(ChangeRoleRequest request)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var user = await _userRepo.GetByIdAsync(request.UserId);
                if (user == null || user.IsDeleted)
                    return false;
                user.Role = request.NewRole;
                await _userRepo.SaveChangesAsync();

                if (request.NewRole == UserRole.Staff)
                {
                    var existingProfile = await _staffProfileService.GetByUserIdAsync(request.UserId);
                    if(existingProfile == null)
                    {
                        await _staffProfileService.CreateAsync(new CreateStaffProfileRequest
                        {
                            UserId = request.UserId,
                            Bio = "Nhân viên mới",
                            ServiceIds = new List<int>()
                        });
                    }
                }

                await transaction.CommitAsync(); 
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); 
                throw new Exception("Đã có lỗi xảy ra khi thay đổi vai trò: " + ex.ToString());
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.IsDeleted)
                throw new KeyNotFoundException("Tài khoản không tồn tại.");
            if(user.Id == _currentUserService.UserId)
                throw new InvalidOperationException("Bạn không thể xóa tài khoản của chính mình.");
            user.IsDeleted = true;
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<UserResponse>> GetAllAsync(int pageNumber, int pageSize)
        {
            var users = await _userRepo.GetPagedWithProfileAsync(pageNumber, pageSize);
            return users.ToPagedResult<User, UserResponse>(_mapper);
        }

        public async Task<UserResponse?> GetByIdAsync(int id)
        {
            return _mapper.Map<UserResponse?>(await _userRepo.GetWithProfileByIdAsync(id));
        }

        public async Task<PagedResult<UserResponse>> GetUsersByRoleAsync(UserRole role, int pageNumber, int pageSize)
        {
            var currentRole = _currentUserService.Role;
            if (currentRole != UserRole.Admin)
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền truy cập.");
            var users = await _userRepo.GetUsersByRoleAsync(role, pageNumber, pageSize);
            return users.ToPagedResult<User,UserResponse>(_mapper);
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            return  await _userRepo.IsEmailUniqueAsync(email);
        }

        public async Task<bool> ResetPasswordAsync(int id)
        {
            const string newPassword = "123456";
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.IsDeleted)
                throw new KeyNotFoundException("Tài khoản không tồn tại.");
            var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.PasswordHash = newHashedPassword;
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMyProfileAsync(UpdateUserRequest request)
        {
            var userId = _currentUserService.UserId;
            if (!userId.HasValue)
                throw new InvalidOperationException("Không tìm thấy người dùng.");
            var user = await _userRepo.GetByIdAsync(userId.Value);
            if (user == null || user.IsDeleted)
                throw new InvalidOperationException("User không tồn tại.");
            _mapper.Map(request, user);
            string? oldAvatarPublicId = user.AvatarPublicId;
            if(request.AvatarUrl != null)
            {
                var photoResult = await _photoService.UploadPhotoAsync(request.AvatarUrl, true);
                user.AvatarUrl = photoResult.Url;
                user.AvatarPublicId = photoResult.PublicId;
            }
            await _userRepo.SaveChangesAsync();
            if(request.AvatarUrl != null && !string.IsNullOrEmpty(oldAvatarPublicId))
            {
                try
                {
                    await _photoService.DeletePhotoAsync(oldAvatarPublicId);
                }
                catch (Exception ex)
                {
                    // Log lỗi nếu cần thiết
                    Console.WriteLine($"Lỗi khi xóa ảnh cũ: {ex.Message}");
                }
            }
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, bool isActive)
        {
            // 1. Get user by id
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.IsDeleted)
                throw new KeyNotFoundException("Tài khoản không tồn tại.");

            // 2. Update status
            user.IsActived = isActive;

            await _userRepo.SaveChangesAsync();
            return true;
        }

        
    }
}
