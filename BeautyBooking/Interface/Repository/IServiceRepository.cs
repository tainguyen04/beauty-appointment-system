using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
namespace BeautyBooking.Interface.Repository
{
    public interface IServiceRepository: IRepository<Entities.Service, int>
    {
        Task<PagedResult<Entities.Service>> GetPagedWithCategoryAsync(int pageNumber, int pageSize);
        Task<Entities.Service?> GetByIdWithCategoryAsync(int id);
        Task<IEnumerable<Entities.Service>> GetByCategoryIdAsync(int categoryId);

        Task<IEnumerable<Entities.Service>> GetByStaffIdAsync(int staffId);
        Task<IEnumerable<Entities.Service>> GetByIdsAsync(List<int> ids);

        Task UpdateImageAsync(int id, string imgUrl, string imgPublicId);

    }
}
