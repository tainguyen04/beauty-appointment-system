using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using BeautyBooking.MappingProfiles;

namespace BeautyBooking.Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly IServiceRepository _serviceRepo;
        private readonly IStaffProfileRepository _staffProfileRepo;
        private readonly IPhotoService _photoService;
        private readonly IMapper _mapper;
        public ServiceManager(IServiceRepository serviceRepo, IMapper mapper, IStaffProfileRepository staffProfileRepo, IPhotoService photoService)
        {
            _serviceRepo = serviceRepo;
            _mapper = mapper;
            _staffProfileRepo = staffProfileRepo;
            _photoService = photoService;
        }

        public async Task<decimal> CalculateTotalAmountAsync(IEnumerable<int> serviceIds)
        {
            var distinctServiceIds = serviceIds.Distinct().ToList();
            if(!distinctServiceIds.Any())
                return 0;

            var services = await _serviceRepo.GetByIdsAsync(distinctServiceIds);
            var serviceList = services.ToList();
            if(serviceList.Count != distinctServiceIds.Count)
            {
                var existingIds = serviceList.Select(s => s.Id);
                var missingIds = distinctServiceIds.Except(existingIds);
                throw new KeyNotFoundException($"Dịch vụ với Id(s) {string.Join(", ", missingIds)} không tồn tại.");
            }
                
            return services.Sum(s => s.Price);
        }

        public async Task<int> CreateAsync(CreateServiceRequest request)
        {
            var service = _mapper.Map<Service>(request);
            await _serviceRepo.CreateAsync(service);
            if(request.ImageUrl != null)
            {
                var uploadResult = await _photoService.UploadPhotoAsync(request.ImageUrl, false);
                service.ImageUrl = uploadResult.Url;
                service.ImagePublicId = uploadResult.PublicId;
            }
            await _serviceRepo.SaveChangesAsync();
            return service.Id;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _serviceRepo.GetByIdAsync(id);
            if (service == null)
                throw new KeyNotFoundException("Service khọng tồn tại.");
            service.IsDeleted = true;
            await _serviceRepo.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<ServiceResponse>> GetAllAsync(int pageNumber, int pageSize)
        {
            var pagedServices = await _serviceRepo.GetAllWithCategoryAsync(pageNumber, pageSize);
            return pagedServices.ToPagedResult<Service, ServiceResponse>(_mapper);
        }

        public async Task<IEnumerable<ServiceResponse>> GetByCategoryIdAsync(int categoryId)
        {
            var category = await _serviceRepo.GetByCategoryIdAsync(categoryId);
            if(category == null)
                throw new KeyNotFoundException("Category không tồn tại");

            return _mapper.Map<List<ServiceResponse>>(category);
        }

        public async Task<ServiceResponse?> GetByIdAsync(int id)
        {
            var service = await _serviceRepo.GetByIdWithCategoryAsync(id);
            if (service == null)
                throw new KeyNotFoundException("Service không tồn tại.");
            return _mapper.Map<ServiceResponse?>(service);
        }

        public async Task<IEnumerable<ServiceResponse>> GetByStaffIdAsync(int staffId)
        {
            var staffProfile = await _staffProfileRepo.GetByIdAsync(staffId);
            if (staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại.");
            var services = await _serviceRepo.GetByStaffIdAsync(staffId);
            return _mapper.Map<IEnumerable<ServiceResponse>>(services);
        }

        public async Task<bool> UpdateAsync(int id, UpdateServiceRequest request)
        {
            var existingService = await _serviceRepo.GetByIdAsync(id);
            if (existingService == null)
                throw new KeyNotFoundException("Service không tồn tại.");
            _mapper.Map(request, existingService);
            string? oldImagePublicId = existingService.ImagePublicId;
            if(request.ImageUrl != null)
            {
                var uploadResult = await _photoService.UploadPhotoAsync(request.ImageUrl, false);
                existingService.ImageUrl = uploadResult.Url;
                existingService.ImagePublicId = uploadResult.PublicId;
            }
            await _serviceRepo.SaveChangesAsync();
            if(request.ImageUrl != null && !string.IsNullOrEmpty(oldImagePublicId))
            {
                try
                {
                    await _photoService.DeletePhotoAsync(oldImagePublicId);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi xóa ảnh cũ: {ex.Message}");
                }
            }
            return true;
        }
    }
}
