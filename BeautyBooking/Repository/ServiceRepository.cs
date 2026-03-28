using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class ServiceRepository : Repository<Service, int>, IServiceRepository
    {
        public ServiceRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }


        public async Task<List<Service>> GetAllWithCategoryAsync()
        {
            return await _entities.Include(s => s.Category).Where(s => !s.IsDeleted).ToListAsync();
        }

        public async Task<Service?> GetByIdWithCategoryAsync(int id)
        {
            return await _entities.Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public async Task<IEnumerable<Service>> GetWithCategoryIdAsync(int categoryId)
        {
            return await _entities.Include(s => s.Category)
                .Where(s => s.CategoryId == categoryId && !s.IsDeleted)
                .ToListAsync();
        }
    }
}
