using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class WorkScheduleRepository : Repository<WorkSchedule, int>, IWorkScheduleRepository
    {
        public WorkScheduleRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public IQueryable<WorkSchedule> GetAllSchedulesByDayOfWeek(DayOfWeek dayOfWeek)
        {
            return _entities.Where(ws => ws.DayOfWeek == dayOfWeek && !ws.IsDeleted).AsNoTracking();
        }

        public IQueryable<WorkSchedule> GetByStaffIdAndDayOfWeek(int staffId, DayOfWeek dayOfWeek)
        {
            return _entities.Where(ws => ws.StaffId == staffId && ws.DayOfWeek == dayOfWeek && !ws.IsDeleted).AsNoTracking();
        }

        public IQueryable<WorkSchedule> GetByStaffIdAsync(int staffId)
        {
            return _entities.Where(ws => ws.StaffId == staffId && !ws.IsDeleted).AsNoTracking();
        }

        public async Task<WorkSchedule?> GetDetailedByIdAsync(int id)
        {
            return await _entities
                .Include(ws => ws.Staff)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(ws => ws.Id == id);
        }
        public async Task<bool> HasOverlapAsync(int staffId, DayOfWeek dayOfWeek, int startTime, int endTime, int? excludeScheduleId = null)
        {
            return await _entities.AnyAsync(ws =>
                ws.StaffId == staffId &&
                ws.DayOfWeek == dayOfWeek &&
                ((startTime < ws.EndTime && endTime > ws.StartTime)) &&
                (!excludeScheduleId.HasValue || ws.Id != excludeScheduleId.Value));
        }

        public IQueryable<WorkSchedule> QueryDetailed()
        {
            return _entities
                .Include(ws => ws.Staff)
                    .ThenInclude(s => s.User)
                .AsNoTracking();
        }
    }
}
