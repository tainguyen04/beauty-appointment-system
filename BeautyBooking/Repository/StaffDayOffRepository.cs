using BeautyBooking.EF;
using BeautyBooking.Entities;
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

        public async Task<IEnumerable<StaffDayOff>> GetAllByMonthAsync(int month, int year)
        {
            return await _entities.Where(s => s.Date.Month == month && s.Date.Year == year && !s.IsDeleted).ToListAsync();
        }

        public async Task<IEnumerable<StaffDayOff>> GetAllWithStaffAsync()
        {
            return await _entities.Include(s => s.Staff).ThenInclude(s => s.User).Where(s => !s.IsDeleted).ToListAsync();
        }

        public async Task<StaffDayOff?> GetByIdWithStaffAsync(int id)
        {
            return await _entities.Include(s => s.Staff).ThenInclude(s => s.User).FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public async Task<List<StaffDayOff>> GetByStaffIdAsync(int staffId)
        {
            return await _entities
                .Include(s => s.Staff).ThenInclude(s => s.User)
                .Where(s => s.StaffId == staffId && !s.IsDeleted).ToListAsync();
        }

        public async Task<IEnumerable<StaffDayOff>> GetPendingDayOffAsync()
        {
            return await _entities.Where(s => s.Status == StaffDayOffStatus.Pending && !s.IsDeleted).ToListAsync();
        }

        public async Task<bool> IsAlreadyOffAsync(int staffId, DateOnly date)
        {
            return await _entities.AnyAsync(s => s.StaffId == staffId && s.Date == date);
        }
    }
}
