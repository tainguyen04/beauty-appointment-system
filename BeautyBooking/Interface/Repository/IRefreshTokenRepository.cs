using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IRefreshTokenRepository : IRepository<RefreshToken, int>
    {
        Task<RefreshToken?> GetByTokenAsync(string refreshToken);
        Task<List<RefreshToken>> FindAllAsync(int userId);
    }
}
