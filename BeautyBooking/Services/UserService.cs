using AutoMapper;
using AutoMapper.QueryableExtensions;
using BeautyBooking.DTO.Filter;
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
                if (request.NewRole == UserRole.Admin)
                    throw new InvalidOperationException("Không thể gán vai trò Admin.");

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
                    else
                    {
                        // Nếu đã có profile nhân viên, đảm bảo nó được kích hoạt
                        // isDeleted = false để profile có thể hiển thị lại nếu trước đó đã bị xóa mềm
                        await _staffProfileService.UpdateStatusAsync(request.UserId, false);
                    }
                }
                if(user.Role == UserRole.Staff && request.NewRole != UserRole.Staff)
                {
                    // Nếu chuyển từ Staff sang vai trò khác, đảm bảo profile nhân viên bị vô hiệu hóa
                    //isDeleted = true để profile không hiển thị nữa nhưng vẫn giữ lại dữ liệu nếu sau này muốn chuyển lại thành Staff
                    await _staffProfileService.UpdateStatusAsync(request.UserId, true);
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

        public async Task<int> CreateUserAsync(CreateUserRequest request)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var existingUser = await _userRepo.GetByEmailAsync(request.Email);
                if (existingUser != null && !existingUser.IsDeleted)
                    throw new InvalidOperationException("Email đã được sử dụng.");
                if (request.Role == UserRole.Admin)
                    throw new InvalidOperationException("Không thể tạo tài khoản Admin.");

                var user = _mapper.Map<User>(request);
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                await _userRepo.CreateAsync(user);
                await _userRepo.SaveChangesAsync();
                if (request.Role == UserRole.Staff)
                {
                    await _staffProfileService.CreateAsync(new CreateStaffProfileRequest
                    {
                        UserId = user.Id,
                        Bio = "Nhân viên mới",
                        ServiceIds = new List<int>()
                    });
                }
                await transaction.CommitAsync();
                return user.Id;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Đã có lỗi xảy ra khi tạo tài khoản: " + ex.ToString());
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

        public async Task<UserResponse?> GetMyProfileAsync()
        {
            var userId = _currentUserService.UserId;
            if (!userId.HasValue)
                throw new InvalidOperationException("Người dùng chưa đăng nhập.");
            return _mapper.Map<UserResponse?>(await _userRepo.GetWithProfileByIdAsync(userId.Value));
        }

        public async Task<PagedResult<UserResponse>> GetUsersAsync(UserFilter filter)
        {
            var query = _userRepo.Query();
            var currentRole = _currentUserService.Role;
            var keyword = filter.Keyword?.Trim();
            if(currentRole != UserRole.Admin)
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền truy cập.");
            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(u => u.FullName.Contains(keyword) ||
                                         u.Email.Contains(keyword));
            if (filter.Role.HasValue)
                query = query.Where(u => u.Role == filter.Role.Value);
            return await query
                .OrderBy(u => u.FullName)
                .ProjectTo<UserResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
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

        public async Task<bool> UpdateProfileByAdminAsync(int id,UpdateUserRequest request)
        {
            var user = await _userRepo.GetWithProfileByIdAsync(id);
            if(user == null || user.IsDeleted)
                throw new KeyNotFoundException("Tài khoản không tồn tại.");
            _mapper.Map(request, user);
            string? oldAvatarPublicId = user.AvatarPublicId;
            string? newAvatarPublicId = null;
            if (request.AvatarUrl != null)
            {
                var photoResult = await _photoService.UploadPhotoAsync(request.AvatarUrl, true);
                user.AvatarUrl = photoResult.Url;
                user.AvatarPublicId = photoResult.PublicId;
                newAvatarPublicId = photoResult.PublicId;
            }
            try
            {
                await _userRepo.SaveChangesAsync();
            }
            catch
            {
                if (newAvatarPublicId != null)
                {
                    try
                    {
                        await _photoService.DeletePhotoAsync(newAvatarPublicId);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Lỗi khi xóa ảnh mới do lỗi khác: {ex.Message}");
                    }
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
