using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class UserRepository : Repository<User, int>, IUserRepository
    {
        public UserRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _entities.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        }

        public IQueryable<User> GetUsersByRole(UserRole role)
        {
            return _entities.Where(u => u.Role == role && !u.IsDeleted);
        }

        public async Task<User?> GetWithProfileByIdAsync(int id)
        {
           return await _entities
                .Include(u => u.StaffProfile)
                .Include(u => u.Ward)
                .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            return !await _entities.AnyAsync(u => u.Email == email && !u.IsDeleted);
        }

        public IQueryable<User> QueryDetailed()
        {
            return _entities
                .Include(u => u.StaffProfile)
                .Include(u => u.Ward)
                .Where(u => !u.IsDeleted);
        }
    }
}
