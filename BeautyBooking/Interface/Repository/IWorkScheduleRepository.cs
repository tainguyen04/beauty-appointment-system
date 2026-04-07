using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IWorkScheduleRepository : IRepository<WorkSchedule, int>
    {
        Task<bool> HasOverlapAsync(int staffId, DayOfWeek dayOfWeek, int startTime, int endTime, int? excludeScheduleId = null);
        Task<WorkSchedule?> GetDetailedByIdAsync(int id);
        IQueryable<WorkSchedule> GetByStaffIdAsync(int staffId);
        IQueryable<WorkSchedule> GetByStaffIdAndDayOfWeek(int staffId, DayOfWeek dayOfWeek);
        IQueryable<WorkSchedule> GetAllSchedulesByDayOfWeek(DayOfWeek dayOfWeek);
        IQueryable<WorkSchedule> QueryDetailed();

    }
}
