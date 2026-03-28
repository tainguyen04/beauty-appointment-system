using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BeautyBooking.Services
{
    public class UserService : IUserSerivce
    {
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;
        private readonly IStaffProfileService _staffProfileService;
        private readonly ApplicationDbContext _dbContext;
        public UserService(IUserRepository userRepo, IMapper mapper, IStaffProfileService staffProfileService,ApplicationDbContext dbContext)
        {
            _userRepo = userRepo;   
            _mapper = mapper;
            _staffProfileService = staffProfileService;
            _dbContext = dbContext;
        }

        public async Task<bool> ChangePasswordAsync(int id, ChangePasswordRequest request)
        {
            // 1. Get user by id
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.IsDeleted)
                return false;

            // 2. Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return false;

            // 3. Hash new password
            var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // 4. Update password
            user.PasswordHash = newHashedPassword;
            _userRepo.Update(user);
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
                    await _staffProfileService.UpSertAsync(new StaffProfileRequest
                    {
                        UserId = request.UserId,
                        Bio = "Nhân viên mới",
                        ServiceIds = new List<int>()
                    });
                }

                await transaction.CommitAsync(); 
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); 
                throw new Exception("Đã có lỗi xảy ra khi thay đổi vai trò: " + ex.Message);
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.IsDeleted)
                return false;
            user.IsDeleted = true;
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserResponse>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<UserResponse>>(await _userRepo.GetAllWithProfileAsync());
        }

        public async Task<UserResponse?> GetByIdAsync(int id)
        {
            return _mapper.Map<UserResponse?>(await _userRepo.GetWithProfileByIdAsync(id));
        }

        public async Task<IEnumerable<UserResponse>> GetUsersByRoleAsync(UserRole role)
        {
            return _mapper.Map<IEnumerable<UserResponse>>(await _userRepo.GetUserByRoleAsync(role));
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            return  await _userRepo.IsEmailUniqueAsync(email);
        }

        public async Task<bool> UpdateProfileAsync(int id, UpdateUserRequest request)
        {
            // 1. Get user by id
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.IsDeleted)
                return false;

            // 2. Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Name))
                user.FullName = request.Name;
            if (!string.IsNullOrWhiteSpace(request.Phone))
                user.Phone = request.Phone;
            if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
                user.AvatarUrl = request.AvatarUrl;
            
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, bool isActive)
        {
            // 1. Get user by id
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.IsDeleted)
                return false;

            // 2. Update status
            user.IsActived = isActive;

            await _userRepo.SaveChangesAsync();
            return true;
        }

        
    }
}
