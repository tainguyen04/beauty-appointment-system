using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IUserService
    {
        Task<int> CreateUserAsync(CreateUserRequest request);
        Task<bool> UpdateProfileByAdminAsync(int id, UpdateUserRequest request);
        Task<bool> UpdateMyProfileAsync(UpdateUserRequest request);
        Task<bool> ChangeMyPasswordAsync(ChangePasswordRequest request);
        Task<bool> UpdateActiveStatusAsync(int id, bool isActive);
        Task<bool> ChangeRoleAsync(int id,ChangeRoleRequest request);
        Task<bool> ResetPasswordAsync(int id);
        Task<bool> DeleteAsync(int id);

        Task<UserResponse?> GetByIdAsync(int id);
        Task<PagedResult<UserResponse>> GetUsersAsync(UserFilter filter);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<UserResponse?> GetMyProfileAsync();



    }
}
