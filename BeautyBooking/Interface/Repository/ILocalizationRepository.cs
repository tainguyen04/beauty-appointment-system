using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface ILocalizationRepository: IRepository<WebsiteLocalization, string>
    {
        Task<List<WebsiteLocalization>> GetAllWithWardsAsync();
        Task<WebsiteLocalization?> GetByKeyWithWardAsync(string key);
    }
}
