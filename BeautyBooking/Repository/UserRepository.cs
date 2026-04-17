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
        public async Task<PagedResult<User>> GetPagedWithProfileAsync(int pageNumber, int pageSize)
        {
            return await _entities
                .Include(u => u.StaffProfile)
                .Include(u => u.Ward)
                .OrderBy(u => u.FullName)
                .AsNoTracking()
                .ToPagedResultAsync(pageNumber, pageSize);

        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _entities
                .Include(u => u.StaffProfile)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<PagedResult<User>> GetUsersByRoleAsync(UserRole role, int pageNumber, int pageSize)
        {
            return await _entities
                .Where(u => u.Role == role)
                .Include(u => u.StaffProfile)
                .Include(u => u.Ward)
                .AsNoTracking()
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<User?> GetWithProfileByIdAsync(int id)
        {
           return await _entities
                .Include(u => u.StaffProfile)
                .Include(u => u.Ward)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            return !await _entities.AnyAsync(u => u.Email == email);
        }

        public IQueryable<User> QueryDetailed()
        {
            return _entities
                .Include(u => u.StaffProfile)
                .Include(u => u.Ward)
                .Where(u => !u.IsDeleted);
        }

        public async Task UpdateAvatarAsync(int userId, string avatarUrl, string avatarPublicId)
        {
             await _entities
                .Where(u => u.Id == userId)
                .ExecuteUpdateAsync(setter => setter
                    .SetProperty(u => u.AvatarUrl, avatarUrl)
                    .SetProperty(u => u.AvatarPublicId, avatarPublicId));
        }

        public async Task<int> GetNewCustomersCountByDateAsync(DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);
            return await _entities
                .Where(u => u.Role == UserRole.Customer && 
                u.CreatedAt.Date >= startOfDay &&
                u.CreatedAt.Date < endOfDay)
                .CountAsync();
        }
    }
}
