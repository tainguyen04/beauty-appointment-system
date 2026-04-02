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


        public async Task<PagedResult<Service>> GetAllWithCategoryAsync(int pageNumber, int pageSize)
        {
            return await _entities.Where(s => !s.IsDeleted)
                .Include(s => s.Category)
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<Service?> GetByIdWithCategoryAsync(int id)
        {
            return await _entities.Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public async Task<IEnumerable<Service>> GetByIdsAsync(List<int> ids)
        {
            return await _entities.Where(s => ids.Contains(s.Id) && !s.IsDeleted)
                .Include(s => s.Category)
                .ToListAsync();
        }

        public async Task<IEnumerable<Service>> GetByStaffIdAsync(int staffId)
        {
            return await _entities.Where(s => s.StaffProfiles.Any(ss => ss.Id == staffId) && !s.IsDeleted)
                .Include(s => s.Category)
                .ToListAsync();
        }

        public async Task<IEnumerable<Service>> GetByCategoryIdAsync(int categoryId)
        {
            return await _entities.Include(s => s.Category)
                .Where(s => s.CategoryId == categoryId && !s.IsDeleted)
                .ToListAsync();
        }
    }
}
