using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IServiceManager
    {
        Task<List<ServiceResponse>> GetAllAsync();
        Task<ServiceResponse?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateServiceRequest request);
        Task<bool> Update(int id, UpdateServiceRequest request);
        Task<bool> DeleteAsync(int id);
        Task<List<ServiceResponse>> GetByCategoryIdAsync(int categoryId);
        Task<decimal> CalculateTotalAmountAsync(IEnumerable<int> serviceIds);

    }
}
