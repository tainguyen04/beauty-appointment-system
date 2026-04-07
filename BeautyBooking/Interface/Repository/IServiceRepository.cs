using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
namespace BeautyBooking.Interface.Repository
{
    public interface IServiceRepository: IRepository<Entities.Service, int>
    {
        IQueryable<Entities.Service> QueryDetailed();
        Task<Entities.Service?> GetByIdWithCategoryAsync(int id);
        IQueryable<Entities.Service> GetByCategoryId(int categoryId);

        IQueryable<Entities.Service> GetByStaffId(int staffId);
        IQueryable<Entities.Service> GetByIds(List<int> ids);

    }
}
