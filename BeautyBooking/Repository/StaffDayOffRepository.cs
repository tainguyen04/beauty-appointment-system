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


        public async Task<StaffDayOff?> GetByIdWithStaffAsync(int id)
        {
            return await _entities
                .Include(s => s.Staff)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public async Task<bool> IsAlreadyOffAsync(int staffId, DateOnly date)
        {
            return await _entities.AnyAsync(s => s.StaffId == staffId && s.Date == date);
        }
    }
}
