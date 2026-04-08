using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface ISearchService
    {
        Task<PagedResult<AppointmentResponse>> SearchAppointmentsAsync(AppointmentFilter filter);
        Task<IEnumerable<CategoryResponse>> SearchCategoriesAsync(CategoryFilter filter);
        Task<PagedResult<ServiceResponse>> SearchServicesAsync(ServiceFilter filter);
        Task<PagedResult<StaffProfileResponse>> SearchStaffProfilesAsync(StaffProfileFilter filter);
        Task<PagedResult<UserResponse>> SearchUsersAsync(UserFilter filter);
        Task<PagedResult<WorkScheduleResponse>> SearchWorkSchedulesAsync(WorkScheduleFilter filter);
        Task<PagedResult<StaffDayOffResponse>> SearchStaffDayOffsAsync(StaffDayOffFilter filter);
    }
}
