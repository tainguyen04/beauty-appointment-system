using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface ICategoryService
    {
        Task<List<CategoryResponse>> GetAllAsync();
        Task<CategoryResponse?> GetByIdAsync(int id);
        Task<int> CreateAsync(CategoryRequest request);
        Task<bool> Update(int id, CategoryRequest request);
        Task<bool> DeleteAsync(int id);
    }
}
