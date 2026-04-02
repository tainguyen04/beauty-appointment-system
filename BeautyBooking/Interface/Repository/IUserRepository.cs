using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IUserRepository : IRepository<User, int>
    {
        Task<PagedResult<User>> GetAllWithProfileAsync(int pageNumber, int pageSize);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> IsEmailUniqueAsync(string email);
        Task<User?> GetWithProfileByIdAsync(int userId);
        Task<PagedResult<User>> GetUsersByRoleAsync(UserRole role, int pageNumber, int pageSize);
    }
}
