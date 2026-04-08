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

        public async Task<IEnumerable<StaffDayOff>> GetAllByMonthAsync(int month, int year, StaffDayOffStatus status)
        {
            return await _entities
                .Where(s => s.Date.Month == month && 
                            s.Date.Year == year && 
                            s.Status == status && !s.IsDeleted)
                .ToListAsync();
        }
        public async Task<PagedResult<StaffDayOff>> GetPagedWithStaffAsync(int pageNumber, int pageSize)
        {
            return await _entities
                .Where(s => !s.IsDeleted)
                .Include(s => s.Staff).ThenInclude(s => s.User)
                .OrderByDescending(s => s.Date)
                .AsNoTracking()
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<StaffDayOff?> GetByIdWithStaffAsync(int id)
        {
            return await _entities
                .Include(s => s.Staff)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public async Task<IEnumerable<StaffDayOff>> GetByStaffIdAsync(int staffId, StaffDayOffStatus status)
        {
            return await _entities
                .Include(s => s.Staff)
                    .ThenInclude(s => s.User)
                .Where(s => s.StaffId == staffId && s.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<StaffDayOff>> GetPendingDayOffAsync()
        {
            return await _entities
                .Where(s => s.Status == StaffDayOffStatus.Pending && !s.IsDeleted)
                .ToListAsync();
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
    }
}
