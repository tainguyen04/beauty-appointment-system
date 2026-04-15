using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IStaffProfileService
    { 
        Task<int> CreateAsync(CreateStaffProfileRequest request);
        Task<bool> UpdateAsync(int id, UpdateStaffProfileRequest request);
        Task<bool> AssignServicesAsync(int id, AssignServicesRequest request);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateActiveStatusAsync(int id, bool isActive);

        Task<StaffProfileResponse?> GetByIdAsync(int id);
        Task<StaffProfileResponse?> GetByUserIdAsync(int userId);
        Task<StaffProfileResponse?> GetMyProfileAsync();
        Task<IEnumerable<StaffProfileResponse>> GetAvailableAsync(
            DateOnly date, int startTime, List<int> serviceIds, int? wardId = null);
        Task<PagedResult<StaffProfileResponse>> GetStaffProfilesAsync(StaffProfileFilter filter);
    }
}
