using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class RefreshTokenRepository : Repository<RefreshToken, int>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task<List<RefreshToken>> FindAllAsync(int userId)
        {
            return await _entities.Where(x => x.UserId == userId && x.IsRevoked).ToListAsync();
        }

        public async Task<RefreshToken?> GetByTokenAsync(string refreshToken)
        {
           return await _entities.FirstOrDefaultAsync(x => x.Token == refreshToken);
        }
    }
}
