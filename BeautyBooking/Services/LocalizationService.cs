using AutoMapper;
using AutoMapper.QueryableExtensions;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using Microsoft.EntityFrameworkCore;

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

        public async Task<bool> ActiveAsync(string id)
        {
            var localization = await _localizationRepo.GetByIdAsync(id);
            if (localization == null)
                return false;
            localization.IsActived = true;
            await _localizationRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActiveWardAsync(string key, IEnumerable<int> wardIds)
        {
            var localization = await _localizationRepo.GetByKeyWithWardAsync(key);
            if (localization == null)
                throw new KeyNotFoundException("Localization không tồn tại.");
            if (localization.WebsiteLocalizationWards == null)
                return false;
            var wardsToActivate = localization.WebsiteLocalizationWards
                        .Where(w => wardIds.Contains(w.WardId))
                        .ToList();
            if (!wardsToActivate.Any())
                return false;
            foreach (var ward in wardsToActivate)
            {
                ward.IsActived = true;
            }
            await _wardRepo.SaveChangesAsync();
            return true;
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

        public async Task<bool> DeleteWardAsync(string key, IEnumerable<int> wardIds)
        {
            var localization = await _localizationRepo.GetByKeyWithWardAsync(key);
            if (localization == null)
                throw new KeyNotFoundException("Localization không tồn tại.");
            if (localization.WebsiteLocalizationWards == null)
                return false;
            var wardsToDelete = localization.WebsiteLocalizationWards
                        .Where(w => wardIds.Contains(w.WardId))
                        .ToList();

            if(!wardsToDelete.Any())
                return false;
            foreach (var ward in wardsToDelete)
            {
                ward.IsActived = false;
            }

            await _wardRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<LocalizationResponse>> GetAllAsync()
        {
            return await _localizationRepo
                .Query()
                .Where(l => l.IsActived)
                .ProjectTo<LocalizationResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<LocalizationResponse?> GetByIdAsync(string id)
        {
            var localization = await _localizationRepo.GetByKeyWithWardAsync(id);
            return localization == null ? null : _mapper.Map<LocalizationResponse>(localization);
        }

        public async Task<bool> UpdateAsync(string key, UpdateLocalizationRequest request)
        {
            var existingLocalization = await _localizationRepo.GetByKeyWithWardAsync(key);
            if (existingLocalization == null)
                return false;
            _mapper.Map(request, existingLocalization);
            
            await _localizationRepo.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateWardAsync(string key, IEnumerable<UpdateWardRequest> request)
        {
            var existingLocalization = await _localizationRepo.GetByKeyWithWardAsync(key);
            if (existingLocalization == null)
                throw new KeyNotFoundException("Localization không tồn tại.");
            if(existingLocalization.WebsiteLocalizationWards == null)
                existingLocalization.WebsiteLocalizationWards = new List<WebsiteLocalizationWard>();
            else
                existingLocalization.WebsiteLocalizationWards.Clear();
            foreach (var ward in request)
            {
                var wardEntity = _mapper.Map<WebsiteLocalizationWard>(ward);
                wardEntity.KeyLocalization = key;
                existingLocalization.WebsiteLocalizationWards.Add(wardEntity);
            }
            await _localizationRepo.SaveChangesAsync();
            return true;

        }
    }
}
