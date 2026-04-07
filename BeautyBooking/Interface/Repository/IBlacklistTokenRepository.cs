using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IBlacklistTokenRepository: IRepository<BlacklistToken, int>
    {
        Task BlacklistTokenAsync(string jti, DateTime expiryDate);
        Task<bool> IsTokenBlacklistedAsync(string jti);
    }
}
