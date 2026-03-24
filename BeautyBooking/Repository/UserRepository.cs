using BeautyBooking.EF;
using BeautyBooking.Entities;
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

        public async Task<IEnumerable<User>> GetAllWithProfileAsync()
        {
            return await _entities.Include(u => u.StaffProfile)
                          .Include(u => u.Ward)
                          .Where(u => !u.IsDeleted)
                          .ToListAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _entities.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        }

        public async Task<List<User>> GetUserByRoleAsync(UserRole role)
        {
            return await _entities.Where(u => u.Role == role && !u.IsDeleted).ToListAsync();
        }

        public async Task<User?> GetWithProfileByIdAsync(int userId)
        {
           return await _entities.Include(u => u.StaffProfile)
                                 .Include(u => u.Ward)
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            return !await _entities.AnyAsync(u => u.Email == email && !u.IsDeleted);
        }
    }
}
