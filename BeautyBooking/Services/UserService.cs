using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
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
        public UserService(IUserRepository userRepo, IMapper mapper)
        {
            _userRepo = userRepo;   
            _mapper = mapper;
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

        public Task<bool> ChangeRoleAsync(ChangeRoleRequest request)
        {
            throw new NotImplementedException();
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
