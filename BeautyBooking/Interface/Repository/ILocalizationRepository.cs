using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface ILocalizationRepository: IRepository<WebsiteLocalization, string>
    {
        IQueryable<WebsiteLocalization> QueryDetailed(); 
        Task<WebsiteLocalization?> GetByKeyWithWardAsync(string key);
    }
}
