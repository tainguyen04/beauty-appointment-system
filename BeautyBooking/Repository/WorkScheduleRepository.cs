using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;
using System;

namespace BeautyBooking.Repository
{
    public class WorkScheduleRepository : Repository<WorkSchedule, int>, IWorkScheduleRepository
    {
        public WorkScheduleRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task<IEnumerable<WorkSchedule>> GetAllSchedulesByDayOfWeekAsync(DayOfWeek dayOfWeek)
        {
            return await _entities
                .Include(ws => ws.Staff)
                    .ThenInclude(s => s.User)
                .Where(ws => ws.DayOfWeek == dayOfWeek && !ws.Staff.IsDeleted)
                .OrderBy(ws => ws.StartTime)
                .ThenBy(ws => ws.Staff.User.FullName)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<WorkSchedule?> GetDetailedByIdAsync(int id)
        {
            return await _entities
                .Include(ws => ws.Staff)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(ws => ws.Id == id && !ws.IsDeleted);
        }

        public async Task<IEnumerable<WorkSchedule>> GetByStaffIdAsync(int staffId)
        {
            return await _entities
                .Where(ws => ws.StaffId == staffId)
                .Include(ws => ws.Staff)
                    .ThenInclude(s => s.User)
                .OrderBy(ws => ws.StartTime)
                .ThenBy(ws => ws.Staff.User.FullName)
                .AsSplitQuery()
                .ToListAsync();
        }
        public async Task<IEnumerable<WorkSchedule>> GetByStaffIdAndDayOfWeekAsync(int staffId, DayOfWeek dayOfWeek)
        {
            return await _entities
                .Where(ws => ws.DayOfWeek == dayOfWeek && ws.StaffId == staffId)
                .Include(ws => ws.Staff)
                    .ThenInclude(s => s.User)
                .OrderBy(ws => ws.StartTime)
                .ThenBy(ws => ws.Staff.User.FullName)
                .AsSplitQuery()
                .ToListAsync();
        }

        public async Task<bool> HasOverlapAsync(int staffId, DayOfWeek dayOfWeek, int startTime, int endTime, int? excludeScheduleId = null)
        {
            return await _entities.AnyAsync(ws =>
                ws.StaffId == staffId &&
                ws.DayOfWeek == dayOfWeek &&
                ((startTime < ws.EndTime && endTime > ws.StartTime)) &&
                (!excludeScheduleId.HasValue || ws.Id != excludeScheduleId.Value));
        }

        public async Task<PagedResult<WorkSchedule>> GetPagedSchedulesAsync(int pageNumber, int pageSize)
        {
            return await _entities
                .Include(ws => ws.Staff)
                    .ThenInclude(s => s.User)
                .OrderBy(ws => ws.DayOfWeek)
                .ThenBy(ws => ws.StartTime)
                .AsSplitQuery()
                .AsNoTracking()
                .ToPagedResultAsync(pageNumber, pageSize);
        }
    }
}
