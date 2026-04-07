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
        public async Task<HelpdeskCatalog?> GetContentsByIdAsync(int id)
        {
            return await _entities.Include(c => c.HelpdeskContents)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CatalogId == id && c.IsActived);
        }

        public IQueryable<HelpdeskCatalog> QueryDetailed()
        {
            return _entities.Include(c => c.HelpdeskContents).AsNoTracking();
        }
    }
}
