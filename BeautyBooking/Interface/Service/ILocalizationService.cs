using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface ILocalizationService
    {
        Task<IEnumerable<LocalizationResponse>> GetAllAsync();
        Task<LocalizationResponse?> GetByIdAsync(string id);
        Task<string> CreateAsync(CreateLocalizationRequest request);
        Task<bool> AddWardAsync(string key, IEnumerable<CreateWardRequest> request);
        Task<bool> UpdateAsync(string key,UpdateLocalizationRequest request);
        Task<bool> UpdateWardAsync(string key, IEnumerable<UpdateWardRequest> request);
        Task<bool> ActiveAsync(string id);
        Task<bool> DeleteAsync(string id);
        Task<bool> ActiveWardAsync(string key, IEnumerable<int> wardIds);
        Task<bool> DeleteWardAsync(string key, IEnumerable<int> wardIds);
    }
}
