using BeautyBooking.EF;
using BeautyBooking.Entities;
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

        public async Task<IEnumerable<StaffProfile?>> GetAllStaffWithDetailsAsync()
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .AsSplitQuery()
                .Where(sp => !sp.IsDeleted)
                .ToListAsync();
        }

        public async Task<StaffProfile?> GetByIdWithDetailsAsync(int id)
        {
            return await _entities
                .Include(sp => sp.User)
                .Include(sp => sp.Services)
                .AsSplitQuery()
                .FirstOrDefaultAsync(sp => sp.Id == id && !sp.IsDeleted);
        }

        public async Task<StaffProfile?> GetByUserIdAsync(int userId, bool includeUser)
        {
            var query = _entities.AsQueryable();
            query = query.Include(sp => sp.Services);
            if(includeUser)
            {
                query = query.Include(sp => sp.User);
            }
            return await query.AsSplitQuery().FirstOrDefaultAsync(sp => sp.UserId == userId && !sp.IsDeleted);
        }

        
    }
}
