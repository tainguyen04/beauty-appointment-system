using AutoMapper;
using AutoMapper.QueryableExtensions;
using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using BeautyBooking.MappingProfiles;
using Microsoft.EntityFrameworkCore;

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
        public async Task<decimal> CalculateTotalPriceAsync(IEnumerable<int> serviceIds)
        {
            if(serviceIds == null)
                throw new ArgumentNullException(nameof(serviceIds), "Danh sách serviceIds không được null.");
            var distinctServiceIds = serviceIds.Distinct().ToList();
            if(!distinctServiceIds.Any())
                return 0;

            var services = (await _serviceRepo.GetRangeByIdsAsync(distinctServiceIds)).ToList();
            if (services.Count != distinctServiceIds.Count)
            {
                var existingIds = services.Select(s => s.Id);
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
                await _serviceRepo.UpdateImageAsync(service.Id, uploadResult.Url, uploadResult.PublicId);
            }
            await _serviceRepo.SaveChangesAsync();
            return service.Id;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _serviceRepo.GetByIdAsync(id);
            if (service == null)
                throw new KeyNotFoundException("Service không tồn tại.");
            service.IsDeleted = true;
            await _serviceRepo.SaveChangesAsync();
            return true;
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
            if (!services.Any())
                throw new KeyNotFoundException("Không tìm thấy dịch vụ nào cho nhân viên này.");
            return _mapper.Map<IEnumerable<ServiceResponse>>(services);
        }

        public async Task<PagedResult<ServiceResponse>> GetServicesAsync(ServiceFilter filter)
        {
            var query = _serviceRepo.Query();
            var keyword = filter.Keyword?.Trim();
            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(s => s.Name.Contains(keyword) ||
                                         s.Category.Name.Contains(keyword));
            if(filter.CategoryId.HasValue)
                query = query.Where(s => s.CategoryId == filter.CategoryId.Value);
            return await query
                .OrderBy(c => c.Name)
                .ProjectTo<ServiceResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
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
                await _serviceRepo.UpdateImageAsync(existingService.Id, uploadResult.Url, uploadResult.PublicId);
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

        public async Task<bool> UpdateStatusAsync(int id, bool isActive)
        {
            var service = await _serviceRepo.GetByIdAsync(id);
            if (service == null)
                throw new KeyNotFoundException("Service không tồn tại.");
            service.IsActive = isActive;
            await _serviceRepo.SaveChangesAsync();
            return true;
        }
    }
}
