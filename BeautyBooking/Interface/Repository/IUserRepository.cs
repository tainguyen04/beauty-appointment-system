using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IUserRepository : IRepository<User, int>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetAllWithProfileAsync();
        Task<bool> IsEmailUniqueAsync(string email);
        Task<User?> GetWithProfileByIdAsync(int userId);
        Task<List<User>> GetUserByRoleAsync(UserRole role);
    }
}
