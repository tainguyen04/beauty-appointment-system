using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IUserRepository : IRepository<User, int>
    {
        Task<PagedResult<User>> GetPagedWithProfileAsync(int pageNumber, int pageSize);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> IsEmailUniqueAsync(string email);
        Task<User?> GetWithProfileByIdAsync(int id);
        Task<PagedResult<User>> GetUsersByRoleAsync(UserRole role, int pageNumber, int pageSize);
        Task UpdateAvatarAsync(int userId, string avatarUrl, string avatarPublicId);
    }
}
