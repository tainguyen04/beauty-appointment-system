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

        public IQueryable<Service> QueryDetailed()
        {
            return _entities
                .Include(s => s.Category)
                .Include(s => s.StaffProfiles)
                .Include(s => s.AppointmentServices)
                .AsSplitQuery()
                .AsNoTracking();
        }
    }
}
