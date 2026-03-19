using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface ICatalogService
    {
        Task<List<HelpdeskCatalogResponse>> GetAllAsync();
        Task<HelpdeskCatalogResponse?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateCatalogRequest request);
        Task<bool> Update(int id,UpdateCatalogRequest request);
        Task<bool> DeleteAsync(int id);
    }
}
