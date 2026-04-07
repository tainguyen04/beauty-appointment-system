using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class StaffDayOffRepository : Repository<StaffDayOff, int>, IStaffDayOffRepository
    {
        public StaffDayOffRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public IQueryable<StaffDayOff> GetAllByMonth(int month, int year, StaffDayOffStatus status)
        {
            return _entities
                .Where(s => s.Date.Month == month && s.Date.Year == year && s.Status == status)
                .AsNoTracking();
        }

        public async Task<StaffDayOff?> GetByIdWithStaffAsync(int id)
        {
            return await _entities
                .Include(s => s.Staff)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public IQueryable<StaffDayOff> GetByStaffId(int staffId, StaffDayOffStatus status)
        {
            return _entities
                .Where(s => s.StaffId == staffId && s.Status == status)
                .AsNoTracking();
        }

        public IQueryable<StaffDayOff> GetPendingDayOff()
        {
            return _entities
                .Where(s => s.Status == StaffDayOffStatus.Pending)
                .AsNoTracking();
        }

        public async Task<List<int>> GetStaffIdsOffByDateAsync(DateOnly date)
        {
            return await _entities
                .Where(s => s.Date == date && s.Status == StaffDayOffStatus.Approved)
                .Select(s => s.StaffId)
                .Distinct()
                .ToListAsync();
        }

        public async Task<bool> IsAlreadyOffAsync(int staffId, DateOnly date)
        {
            return await _entities.AnyAsync(s => s.StaffId == staffId && s.Date == date);
        }

        public IQueryable<StaffDayOff> QueryDetailed()
        {
            return _entities
                .Include(s => s.Staff)
                    .ThenInclude(s => s.User)
                .AsNoTracking();
        }
        
    }
}
