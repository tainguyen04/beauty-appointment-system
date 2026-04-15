using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Helper;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class ServiceRepository : Repository<Service, int>, IServiceRepository
    {
        public ServiceRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }

        public async Task<Service?> GetByIdWithCategoryAsync(int id)
        {
            return await _entities.Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<PagedResult<Service>> GetPagedWithCategoryAsync(int pageNumber, int pageSize)
        {
            return await _entities
                .Include(s => s.Category)
                .OrderBy(s => s.Name)
                .ToPagedResultAsync(pageNumber, pageSize);
        }
        public async Task<IEnumerable<Service>> GetByIdsAsync(List<int> ids)
        {
            return await _entities.Where(s => ids.Contains(s.Id))
                .Include(s => s.Category)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<IEnumerable<Service>> GetByStaffIdAsync(int staffId)
        {
            return await _entities
                .Where(s => s.StaffProfiles.Any(ss => ss.Id == staffId))
                .Include(s => s.Category)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<IEnumerable<Service>> GetByCategoryIdAsync(int categoryId)
        {
            return await _entities
                .Include(s => s.Category)
                .Where(s => s.CategoryId == categoryId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task UpdateImageAsync(int id, string imgUrl, string imgPublicId)
        {
            await _entities.Where(s => s.Id == id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(p => p.ImageUrl, imgUrl)
                    .SetProperty(p => p.ImagePublicId, imgPublicId));
        }
    }
}
