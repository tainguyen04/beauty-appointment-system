using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IWorkScheduleService
    {
        
        Task<int> CreateAsync(CreateWorkScheduleRequest request);
        Task<bool> UpdateAsync(int id, UpdateWorkScheduleRequest request);
        Task<bool> DeleteAsync(int id);
        Task<PagedResult<WorkScheduleResponse>> GetAllAsync(int pageNumber, int pageSize);
        Task<WorkScheduleResponse?> GetDetailedByIdAsync(int id);
        Task<IEnumerable<WorkScheduleResponse>> GetMyScheduleAsync();
        Task<IEnumerable<WorkScheduleResponse>> GetByStaffIdAsync(int staffId);
        Task<IEnumerable<WorkScheduleResponse>> GetMyScheduleByDayAsync(DayOfWeek dayOfWeek);
        Task<IEnumerable<WorkScheduleResponse>> GetByDayOfWeekAsync(DayOfWeek dayOfWeek);
        Task<PagedResult<WorkScheduleResponse>> GetWorkSchedulesAsync(WorkScheduleFilter filter);
    }
}
