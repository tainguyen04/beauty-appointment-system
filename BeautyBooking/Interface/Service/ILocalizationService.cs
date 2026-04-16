using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface ILocalizationService
    {
        Task<IEnumerable<LocalizationResponse>> GetAllAsync();
        Task<LocalizationResponse?> GetByIdAsync(string id);
        Task<string> CreateAsync(CreateLocalizationRequest request);
        
        Task<bool> UpdateAsync(string key,UpdateLocalizationRequest request);
        Task<bool> DeleteAsync(string id);
    }
}
