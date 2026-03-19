using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class CatalogRepository : Repository<HelpdeskCatalog, int>, ICatalogRepository
    {
        public CatalogRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task<List<HelpdeskCatalog>> GetAllWithContentsAsync()
        {
            return await _entities.Include(c => c.HelpdeskContents).ToListAsync();
        }

        public async Task<HelpdeskCatalog?> GetWithContentsAsync(int id)
        {
            return await _entities.Include(c => c.HelpdeskContents)
                .FirstOrDefaultAsync(c => c.CatalogId == id);
        }
    }
}
