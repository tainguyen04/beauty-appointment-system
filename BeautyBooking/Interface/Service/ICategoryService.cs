using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface ICategoryService
    {
        Task<CategoryResponse?> GetByIdAsync(int id);
        Task<int> CreateAsync(CategoryRequest request);
        Task<bool> UpdateAsync(int id, CategoryRequest request);
        Task<bool> DeleteAsync(int id);
        Task<PagedResult<CategoryResponse>> GetCategoriesAsync(CategoryFilter filter);
    }
}
