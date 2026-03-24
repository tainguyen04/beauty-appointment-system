using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IUserSerivce
    {
        Task<IEnumerable<UserResponse>> GetAllAsync();
        Task<UserResponse?> GetByIdAsync(int id);
        Task<bool> UpdateProfileAsync(int id, UpdateUserRequest request);
        Task<bool> ChangePasswordAsync(int id, ChangePasswordRequest request);
        Task<bool> UpdateStatusAsync(int id, bool isActive);
        Task<bool> DeleteAsync(int id); 
        Task<bool> IsEmailAvailableAsync(string email);
        Task<bool> ChangeRoleAsync(ChangeRoleRequest request);
        Task<IEnumerable<UserResponse>> GetUsersByRoleAsync(UserRole role);
    }
}
