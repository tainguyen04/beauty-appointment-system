using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface ICatalogRepository: IRepository<HelpdeskCatalog, int>
    {
        Task<List<HelpdeskCatalog>> GetAllWithContentsAsync();
        Task<HelpdeskCatalog?> GetContentsByIdAsync(int id);
    }
}
