using AutoMapper;
using AutoMapper.QueryableExtensions;
using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Service;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IRepository<Category, int> _categoryRepository;
        private readonly IMapper _mapper;
        public CategoryService(IRepository<Category, int> categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }
        public async Task<int> CreateAsync(CategoryRequest request)
        {
            var category = _mapper.Map<Category>(request);
            await _categoryRepository.CreateAsync(category);
            await _categoryRepository.SaveChangesAsync();
            return category.Id;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new KeyNotFoundException("Danh mục không tồn tại.");
            category.IsDeleted = true;
            await _categoryRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CategoryResponse>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<CategoryResponse>>(await _categoryRepository.GetAllAsync());
        }

        public async Task<CategoryResponse?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if(category == null || category.IsDeleted)
                throw new KeyNotFoundException("Danh mục không tồn tại.");
            return _mapper.Map<CategoryResponse?>(category);
        }

        public async Task<PagedResult<CategoryResponse>> GetCategoriesAsync(CategoryFilter filter)
        {
            var query = _categoryRepository.Query();
            var keyword = filter.Keyword?.Trim();
            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(c => c.Name.Contains(keyword));
            return await query
                .OrderBy(c => c.Name)
                .ProjectTo<CategoryResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber,filter.PageSize);
        }

        public async Task<bool> UpdateAsync(int id, CategoryRequest request)
        {
            var existingCategory = await _categoryRepository.GetByIdAsync(id);
            if (existingCategory == null)
                throw new KeyNotFoundException("Danh mục không tồn tại.");
            _mapper.Map(request, existingCategory);
            await _categoryRepository.SaveChangesAsync();
            return true;
        }
    }
}
