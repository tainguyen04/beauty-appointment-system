using BeautyBooking.DTO.Response;

namespace BeautyBooking.Infrastructure
{
    public interface IRepository<T, TId> where T : class
    {
        Task<IReadOnlyList<T>> GetAllAsync();
        Task<T?> GetByIdAsync(TId id);
        Task CreateAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        void DeleteRange(IEnumerable<T> entities);
        Task<IEnumerable<T>> GetRangeByIdsAsync(IEnumerable<int> ids);
        Task SaveChangesAsync();
    }
}
