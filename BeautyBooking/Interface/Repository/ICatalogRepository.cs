using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface ICatalogRepository: IRepository<HelpdeskCatalog, int>
    {
        IQueryable<HelpdeskCatalog> QueryDetailed();
        Task<HelpdeskCatalog?> GetContentsByIdAsync(int id);
    }
}
