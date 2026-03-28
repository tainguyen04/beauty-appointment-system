using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly IServiceRepository _serviceRepo;
        private readonly IMapper _mapper;
        public ServiceManager(IServiceRepository serviceRepo, IMapper mapper)
        {
            _serviceRepo = serviceRepo;
            _mapper = mapper;
        }

        public async Task<decimal> CalculateTotalAmountAsync(IEnumerable<int> serviceIds)
        {
            var services = await _serviceRepo.GetRangeByIdsAsync(serviceIds);
            return services.Sum(s => s.Price);
        }

        public async Task<int> CreateAsync(CreateServiceRequest request)
        {
            var service = _mapper.Map<Entities.Service>(request);
            await _serviceRepo.CreateAsync(service);
            await _serviceRepo.SaveChangesAsync();
            return service.Id;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _serviceRepo.GetByIdAsync(id);
            if (service == null)
                return false;
            service.IsDeleted = true;
            await _serviceRepo.SaveChangesAsync();
            return true;
        }

        public async Task<List<ServiceResponse>> GetAllAsync()
        {
            return _mapper.Map<List<ServiceResponse>>(await _serviceRepo.GetAllWithCategoryAsync());
        }

        public async Task<List<ServiceResponse>> GetByCategoryIdAsync(int categoryId)
        {
            return _mapper.Map<List<ServiceResponse>>(await _serviceRepo.GetWithCategoryIdAsync(categoryId));
        }

        public async Task<ServiceResponse?> GetByIdAsync(int id)
        {
            return _mapper.Map<ServiceResponse?>(await _serviceRepo.GetByIdWithCategoryAsync(id));
        }

        public async Task<bool> Update(int id, UpdateServiceRequest request)
        {
            var existingService = await _serviceRepo.GetByIdAsync(id);
            if (existingService == null)
                return false;
            _mapper.Map(request, existingService);
            await _serviceRepo.SaveChangesAsync();
            return true;
        }
    }
}
