using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class StaffProfileRepository : Repository<StaffProfile, int>, IStaffProfileRepository
    {
        public StaffProfileRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task<IEnumerable<StaffProfile>> GetActiveAsync(int? wardId = null)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .AsSplitQuery()
                .Where(sp => sp.User != null && sp.User.IsActive && sp.WardId == wardId)
                .ToListAsync();
        }

        public async Task<PagedResult<StaffProfile>> GetPagedWithUserAndServicesAsync(int pageNumber, int pageSize)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .OrderByDescending(sp => sp.Id)
                .AsSplitQuery()
                .AsNoTracking()
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<IEnumerable<StaffProfile>> GetAvailableByTimeSlotAsync(
            DateOnly date, int startTime, int endTime, List<int> serviceIds, int? wardId = null)
        {
            int distinctServiceCount = serviceIds.Distinct().Count();
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .Include(sp => sp.WorkSchedules)
                .Include(sp => sp.Appointments)
                .AsSplitQuery()
                .Where(sp => sp.User != null && sp.User.IsActive &&
                             sp.WardId == wardId &&

                        sp.WorkSchedules.Any(
                            ws => ws.DayOfWeek == date.DayOfWeek && 
                            ws.StartTime <= startTime && 
                            ws.EndTime >= endTime) &&

                        //serviceIds.All(sid => sp.Services.Any(s => s.Id == sid)) &&
                        sp.Services.Count(s => serviceIds.Contains(s.Id)) == distinctServiceCount &&


                        !sp.Appointments.Any(a => a.AppointmentDate == date && 
                        a.StartTime < endTime && 
                        a.EndTime > startTime)
                        
                )
                .ToListAsync();
        }

        public async Task<StaffProfile?> GetByIdWithServicesAsync(int id)
        {
            return await _entities
                .Include(sp => sp.Services)
                .FirstOrDefaultAsync(sp => sp.Id == id);
        }

        public async Task<StaffProfile?> GetByIdWithUserAndServicesAsync(int id)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .AsSplitQuery()
                .FirstOrDefaultAsync(sp => sp.Id == id);
        }

        public async Task<IEnumerable<StaffProfile>> GetByServiceIdAsync(int serviceId)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .Where(sp => sp.Services.Any(s => s.Id == serviceId))
                .AsSplitQuery()
                .ToListAsync();
        }

        public async Task<StaffProfile?> GetByUserIdAsync(int userId)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .AsSplitQuery()
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        public async Task<StaffProfile?> GetByUserIdWithUserAsync(int userId)
        {
            return await _entities
                .Include(sp => sp.User)
                .AsSplitQuery()
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        public async Task<IEnumerable<int>> GetServiceIdsByIdAsync(int userId)
        {
            return await _entities
                .Where(sp => sp.Id == userId)
                .SelectMany(sp => sp.Services)
                .Select(s => s.Id)
                .ToListAsync();
        }

        public async Task<PagedResult<StaffProfile>> GetByServiceIdsAsync(
            List<int> serviceIds, int pageNumber, int pageSize, int? wardId = null)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .Where(sp => sp.Services.Any(s => serviceIds.Contains(s.Id)) &&
                            sp.WardId == wardId)
                .AsSplitQuery()
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<IEnumerable<StaffProfile>> GetWorkingByDateAsync(DateOnly date, int? wardId = null)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .Where(sp => sp.Appointments.Any(a => a.AppointmentDate == date &&
                             a.AppointmentStatus != AppointmentStatus.Cancelled) &&
                             sp.WardId == wardId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<StaffProfile>> GetByWardIdAsync(int wardId)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .Where(sp => sp.WardId == wardId)
                .AsSplitQuery()
                .ToListAsync();
        }
    }
}
