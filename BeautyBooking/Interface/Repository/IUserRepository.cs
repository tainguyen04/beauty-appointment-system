using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IUserRepository : IRepository<User, int>
    {
        IQueryable<User> QueryDetailed();
        Task<User?> GetByEmailAsync(string email);
        Task<bool> IsEmailUniqueAsync(string email);
        Task<User?> GetWithProfileByIdAsync(int id);
        IQueryable<User> GetUsersByRole(UserRole role);
    }
}
