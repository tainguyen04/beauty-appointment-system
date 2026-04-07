using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Infrastructure
{
    public class Repository<T, TId> : IRepository<T, TId> where T : class
    {
        protected readonly DbContext _dbcontext;
        protected readonly DbSet<T> _entities;
        public Repository(DbContext dbcontext)
        {
            _dbcontext = dbcontext;
            _entities = _dbcontext.Set<T>();
        }

        public async Task CreateAsync(T entity) => await _entities.AddAsync(entity);

        public void Delete(T entity) => _entities.Remove(entity);

        public void DeleteRange(IEnumerable<T> entities) => _entities.RemoveRange(entities);

        public async Task<IReadOnlyList<T>> GetAllAsync() => await _entities.ToListAsync();

        public async Task<T?> GetByIdAsync(TId id) => await _entities.FindAsync(id);

        public async Task<IEnumerable<T>> GetRangeByIdsAsync(IEnumerable<int> ids)
        {
            if (ids == null || !ids.Any()) return new List<T>();
            var idList = ids.ToList();
            
            return await _entities
                .Where(e => idList.Contains(Microsoft.EntityFrameworkCore.EF.Property<int>(e, "Id")))
                .ToListAsync();
        }

        public IQueryable<T> Query() => _entities.AsNoTracking();

        public Task SaveChangesAsync() => _dbcontext.SaveChangesAsync();

        public void Update(T entity) => _entities.Update(entity);
    }
}
