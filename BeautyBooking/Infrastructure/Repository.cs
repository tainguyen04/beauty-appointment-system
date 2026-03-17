
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

        public async Task<IReadOnlyList<T>> GetAllAsync() => await _entities.ToListAsync();

        public async Task<T?> GetByIdAsync(TId id) => await _entities.FindAsync(id);

        public Task SaveChangesAsync() => _dbcontext.SaveChangesAsync();

        public void Update(T entity) => _entities.Update(entity);
    }
}
