using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IStaffProfileService
    {
        Task<StaffProfileResponse?> GetByIdAsync(int id);
        Task<StaffProfileResponse?> GetByUserIdAsync(int userId);
        Task<StaffProfileResponse?> GetMyProfileAsync();
        Task<IEnumerable<StaffProfileResponse>> GetByServiceIdAsync(int serviceId);
        Task<int> CreateAsync(CreateStaffProfileRequest request);
        Task<bool> UpdateAsync(int id, UpdateStaffProfileRequest request);
        Task<bool> AssignServicesAsync(int id, AssignServicesRequest request);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateStatusAsync(int userId, bool status);
        Task<IEnumerable<StaffProfileResponse>> GetAvailableAsync(DateOnly date, int startTime, List<int> serviceIds);
        Task<PagedResult<StaffProfileResponse>> GetStaffProfilesAsync(StaffProfileFilter filter);
    }
}
