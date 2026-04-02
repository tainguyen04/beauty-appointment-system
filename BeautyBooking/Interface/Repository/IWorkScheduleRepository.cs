using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IWorkScheduleRepository : IRepository<WorkSchedule, int>
    {
        Task<bool> HasOverlapAsync(int staffId, DayOfWeek dayOfWeek, int startTime, int endTime, int? excludeScheduleId = null);
        Task<WorkSchedule?> GetDetailedByIdAsync(int id);
        Task<IEnumerable<WorkSchedule>> GetByStaffIdAsync(int staffId);
        Task<IEnumerable<WorkSchedule>> GetByStaffIdAndDayOfWeekAsync(int staffId, DayOfWeek dayOfWeek);
        Task<IEnumerable<WorkSchedule>> GetAllSchedulesByDayOfWeekAsync(DayOfWeek dayOfWeek);
        Task<PagedResult<WorkSchedule>> GetAllSchedulesAsync(int pageNumber, int pageSize);

    }
}
