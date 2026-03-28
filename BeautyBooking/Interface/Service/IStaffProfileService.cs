using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IStaffProfileService
    {
        Task<List<StaffProfileResponse>> GetAllAsync();
        Task<StaffProfileResponse?> GetByIdAsync(int id);
        Task<StaffProfileResponse> GetByUserIdAsync(int userId);
        Task<int> UpSertAsync(StaffProfileRequest request);
        Task<bool> DeleteAsync(int id);
    }
}
