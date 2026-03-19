using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class LocalizationRepository : Repository<WebsiteLocalization, string>, ILocalizationRepository
    {
        public LocalizationRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task<List<WebsiteLocalization>> GetAllWithWardsAsync()
        {
            return await _entities.Include(l => l.WebsiteLocalizationWards).ToListAsync();
        }

        public async Task<WebsiteLocalization?> GetByKeyWithWardAsync(string key)
        {
            return await _entities.Include(l => l.WebsiteLocalizationWards)
                .FirstOrDefaultAsync(l => l.KeyLocalization == key);
        }
    }
}
