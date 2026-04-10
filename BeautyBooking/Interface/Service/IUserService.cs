using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IUserService
    {
        //Admin
        Task<PagedResult<UserResponse>> GetAllAsync(int pageNumber, int pageSize);
        Task<PagedResult<UserResponse>> GetUsersByRoleAsync(UserRole role, int pageNumber, int pageSize);
        Task<UserResponse?> GetByIdAsync(int id);
        Task<bool> BlockAccountAsync(int id);
        Task<bool> UpdateStatusAsync(int id, bool isActive);
        Task<bool> ChangeRoleAsync(ChangeRoleRequest request);
        Task<bool> ResetPasswordAsync(int id);
        Task<bool> DeleteAsync(int id);
        Task<PagedResult<UserResponse>> GetUsersAsync(UserFilter filter);
        //User,Staff
        Task<bool> UpdateMyProfileAsync(UpdateUserRequest request);
        Task<bool> ChangeMyPasswordAsync(ChangePasswordRequest request);

        //Common
        Task<bool> IsEmailAvailableAsync(string email);
        Task<UserResponse?> GetMyProfileAsync();



    }
}
