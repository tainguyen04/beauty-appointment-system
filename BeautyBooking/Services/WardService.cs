using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class WardService : IWardSerivce
    {
        private readonly IRepository<WebsiteLocalizationWard, int> _wardRepo;
        private readonly IMapper _mapper;
        public WardService(IRepository<WebsiteLocalizationWard, int> wardRepo, IMapper mapper)
        {
            _wardRepo = wardRepo;
            _mapper = mapper;
        }

        public async Task<bool> CreateAsync(string key, CreateWardRequest request)
        {
            var ward = _mapper.Map<WebsiteLocalizationWard>(request);
            ward.KeyLocalization = key;
            await _wardRepo.CreateAsync(ward);
            await _wardRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int wardId)
        {
            var ward = await _wardRepo.GetByIdAsync(wardId);
            if (ward == null)
                return false;
            ward.IsActived = false;
            await _wardRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<WardResponse>> GetAllAsync()
        {
            var wards = await _wardRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<WardResponse>>(wards);
        }

        public async Task<WardResponse?> GetByIdAsync(int wardId)
        {
            var ward = await _wardRepo.GetByIdAsync(wardId);
            if (ward == null)
                return null;
            return _mapper.Map<WardResponse>(ward);
        }

        public async Task<bool> UpdateAsync(int wardId, UpdateWardRequest request)
        {
            var existingWard = await _wardRepo.GetByIdAsync(wardId);
            if (existingWard == null)
                return false;
            _mapper.Map(request, existingWard);
            await _wardRepo.SaveChangesAsync();
            return true;
        }
    }
}
