using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface ILocalizationService
    {
        Task<List<LocalizationResponse>> GetAllAsync();
        Task<LocalizationResponse?> GetByIdAsync(string id);
        Task<string> CreateAsync(CreateLocalizationRequest request);
        Task<bool> Update(string key,UpdateLocalizationRequest request);
        Task<bool> DeleteAsync(string id);
    }
}
