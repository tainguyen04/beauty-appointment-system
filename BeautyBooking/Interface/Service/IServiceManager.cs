using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IServiceManager
    {
        Task<PagedResult<ServiceResponse>> GetAllAsync(int pageNumber, int pageSize);
        Task<ServiceResponse?> GetByIdAsync(int id);
        Task<IEnumerable<ServiceResponse>> GetByStaffIdAsync(int staffId);
        Task<IEnumerable<ServiceResponse>> GetByCategoryIdAsync(int categoryId);
        Task<int> CreateAsync(CreateServiceRequest request);
        Task<bool> UpdateAsync(int id, UpdateServiceRequest request);
        Task<bool> DeleteAsync(int id);

        Task<decimal> CalculateTotalAmountAsync(IEnumerable<int> serviceIds);

    }
}
