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

        public IQueryable<Service> GetByCategoryId(int categoryId)
        {
            return _entities.Where(s => s.CategoryId == categoryId && !s.IsDeleted).AsNoTracking();
        }
        
        public IQueryable<Service> GetByIds(List<int> ids)
        {
            return _entities.Where(s => ids.Contains(s.Id) && !s.IsDeleted).AsNoTracking();
        }

        public async Task<Service?> GetByIdWithCategoryAsync(int id)
        {
            return await _entities.Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public IQueryable<Service> GetByStaffId(int staffId)
        {
            return _entities
                .Where(s => s.StaffProfiles.Any(sp => sp.Id == staffId) && !s.IsDeleted)
                .AsNoTracking();
        }

        public async Task<PagedResult<Service>> GetPagedWithCategoryAsync(int pageNumber, int pageSize)
        {
            return await _entities.Where(s => !s.IsDeleted)
                .Include(s => s.Category)
                .OrderBy(s => s.Name)
                .ToPagedResultAsync(pageNumber, pageSize);
        }
        public async Task<IEnumerable<Service>> GetByIdsAsync(List<int> ids)
        {
            return await _entities.Where(s => ids.Contains(s.Id) && !s.IsDeleted)
                .Include(s => s.Category)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<IEnumerable<Service>> GetByStaffIdAsync(int staffId)
        {
            return await _entities
                .Where(s => s.StaffProfiles.Any(ss => ss.Id == staffId) && !s.IsDeleted)
                .Include(s => s.Category)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<IEnumerable<Service>> GetByCategoryIdAsync(int categoryId)
        {
            return await _entities
                .Include(s => s.Category)
                .Where(s => s.CategoryId == categoryId && !s.IsDeleted)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
