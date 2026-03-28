using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IServiceRepository: IRepository<Entities.Service, int>
    {
        Task<List<Entities.Service>> GetAllWithCategoryAsync();
        Task<Entities.Service?> GetByIdWithCategoryAsync(int id);
        Task<IEnumerable<Entities.Service>> GetWithCategoryIdAsync(int categoryId);
        
    }
}
