using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class LocalizationService : ILocalizationService
    {
        private readonly ILocalizationRepository _localizationRepo;
        private readonly IRepository<WebsiteLocalizationWard, int> _wardRepo;
        private readonly IMapper _mapper;
        public LocalizationService(ILocalizationRepository localizationRepo, IRepository<WebsiteLocalizationWard, int> wardRepo, IMapper mapper)
        {
            _localizationRepo = localizationRepo;
            _wardRepo = wardRepo;
            _mapper = mapper;
        }
        public async Task<string> CreateAsync(CreateLocalizationRequest request)
        {
            var exist = await _localizationRepo.GetByIdAsync(request.KeyLocalization);
            if(exist != null)
            {
                throw new Exception("Mã vùng này đã tồn tại!");
                
            }
            var localization = _mapper.Map<WebsiteLocalization>(request);
            if(localization.WebsiteLocalizationWards != null && localization.WebsiteLocalizationWards.Any())
            {
                foreach (var ward in localization.WebsiteLocalizationWards)
                {
                    ward.KeyLocalization = localization.KeyLocalization;
                }
            }
            await _localizationRepo.CreateAsync(localization);
            await _localizationRepo.SaveChangesAsync();

            return localization.KeyLocalization;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var localization = await _localizationRepo.GetByIdAsync(id);
            if (localization == null)
                return false;
            localization.IsActived = false;
            await _localizationRepo.SaveChangesAsync();
            return true;
        }

        public async Task<List<LocalizationResponse>> GetAllAsync()
        {
            var localization =  await _localizationRepo.GetAllWithWardsAsync();
            return _mapper.Map<List<LocalizationResponse>>(localization);
        }

        public async Task<LocalizationResponse?> GetByIdAsync(string id)
        {
            var localization = await _localizationRepo.GetByKeyWithWardAsync(id);
            return localization == null ? null : _mapper.Map<LocalizationResponse>(localization);
        }

        public async Task<bool> Update(string key, UpdateLocalizationRequest request)
        {
            var existingLocalization = await _localizationRepo.GetByKeyWithWardAsync(key);
            if (existingLocalization == null)
                return false;
            _mapper.Map(request, existingLocalization);
            if(request.Wards != null && request.Wards.Any())
            {
                if (existingLocalization.WebsiteLocalizationWards != null)
                {
                    var oldWard = existingLocalization.WebsiteLocalizationWards.ToList();
                    _wardRepo.DeleteRange(oldWard);
                }
                existingLocalization.WebsiteLocalizationWards = request.Wards.Select(w => new WebsiteLocalizationWard
                {
                    KeyLocalization = existingLocalization.KeyLocalization,
                    Name = w.Name,
                    NameEn = w.NameEn,
                    FullName = w.FullName,
                    FullNameEn = w.FullNameEn,
                    Latitude = w.Latitude,
                    Longitude = w.Longitude
                }).ToList();
              
            }    
            await _localizationRepo.SaveChangesAsync();
            return true;
        }
    }
}
