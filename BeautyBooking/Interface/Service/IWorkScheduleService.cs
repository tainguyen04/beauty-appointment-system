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
        Task<IEnumerable<WorkScheduleResponse>> GetByStaffIdAsync(int staffId);
        Task<IEnumerable<WorkScheduleResponse>> GetByStaffIdAndDayOfWeekAsync(int staffId, DayOfWeek dayOfWeek);
        Task<IEnumerable<WorkScheduleResponse>> GetByDayOfWeekAsync(DayOfWeek dayOfWeek);
    }
}
