using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IContentService
    {
        Task<IEnumerable<HelpdeskContentResponse>> GetAllAsync();
        Task<HelpdeskContentResponse?> GetByIdAsync(int contentId);
        Task<bool> CreateAsync(int catalogId,CreateContentRequest request);
        Task<bool> UpdateAsync(int contentId, UpdateContentRequest request);
        Task<bool> DeleteAsync(int contentId);
    }
}
