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

        public IQueryable<StaffProfile> GetActive()
        {
            return _entities.Where(sp => sp.IsActived && !sp.IsDeleted).AsNoTracking();
        }

        public IQueryable<StaffProfile> GetAvailableByTimeSlot(DateOnly date, int? startTime = null, int? endTime = null)
        {
            return _entities
                .Where(sp => sp.IsActived && !sp.IsDeleted)
                .Where(sp => !sp.Appointments.Any(a =>
                    a.AppointmentDate == date &&
                    (startTime == null || a.StartTime < startTime) &&
                    (endTime == null || a.EndTime > endTime)))
                .AsNoTracking();
        }

        public IQueryable<StaffProfile> GetByServiceId(int serviceId)
        {
            return _entities
                .Where(sp => sp.Services.Any(s => s.Id == serviceId) && !sp.IsDeleted)
                .AsNoTracking();
        }

        public IQueryable<StaffProfile> GetByServiceIds(List<int> serviceIds)
        {
            return _entities
                .Where(sp => sp.Services.Any(s => serviceIds.Contains(s.Id)) && !sp.IsDeleted)
                .AsNoTracking();
        }

        public async Task<StaffProfile?> GetByUserIdAsync(int userId)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .AsSplitQuery()
                .FirstOrDefaultAsync(sp => sp.UserId == userId && !sp.IsDeleted);
        }

        public async Task<StaffProfile?> GetByUserIdWithUserAsync(int userId)
        {
            return await _entities
                .Include(sp => sp.User)
                .AsSplitQuery()
                .FirstOrDefaultAsync(sp => sp.UserId == userId && !sp.IsDeleted);
        }

        public async Task<IEnumerable<int>> GetServiceIdsByIdAsync(int userId)
        {
            return await _entities
                .Where(sp => sp.Id == userId && !sp.IsDeleted)
                .SelectMany(sp => sp.Services)
                .Select(s => s.Id)
                .ToListAsync();
        }

        public IQueryable<StaffProfile> GetWorkingByDate(DateOnly date)
        {
            return _entities
                .Where(sp => sp.Appointments.Any(a => a.AppointmentDate == date && 
                             a.AppointmentStatus != AppointmentStatus.Cancelled) && 
                             !sp.IsDeleted)
                .AsNoTracking();
        }

        public IQueryable<StaffProfile> QueryDetailed()
        {
            return _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .Include(sp => sp.StaffDayOffs)
                .Include(sp => sp.Appointments)
                .AsSplitQuery()
                .Where(sp => !sp.IsDeleted);
        }
    }
}
