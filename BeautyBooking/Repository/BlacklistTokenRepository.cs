using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class BlacklistTokenRepository : Repository<BlacklistToken, int>, IBlacklistTokenRepository
    {
        public BlacklistTokenRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task BlacklistTokenAsync(string jti, DateTime expiryDate)
        {
            var blacklistToken = new BlacklistToken
            {
                Jti = jti,
                ExpiryDate = expiryDate
            };
            await _entities.AddAsync(blacklistToken);
        }

        public async Task<bool> IsTokenBlacklistedAsync(string jti)
        {
            return await _entities.AnyAsync(t => t.Jti == jti);
        }
    }
}
