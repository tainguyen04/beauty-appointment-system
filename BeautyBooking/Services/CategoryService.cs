using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Service;

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
                return false;
            category.IsDeleted = true;
            await _categoryRepository.SaveChangesAsync();
            return true;
        }

        public async Task<List<CategoryResponse>> GetAllAsync()
        {
            return _mapper.Map<List<CategoryResponse>>(await _categoryRepository.GetAllAsync());
        }

        public async Task<CategoryResponse?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            return category == null ? null : _mapper.Map<CategoryResponse?>(category);
        }

        public async Task<bool> Update(int id, CategoryRequest request)
        {
            var existingCategory = await _categoryRepository.GetByIdAsync(id);
            if (existingCategory == null)
                return false;
            _mapper.Map(request, existingCategory);
            await _categoryRepository.SaveChangesAsync();
            return true;
        }
    }
}
