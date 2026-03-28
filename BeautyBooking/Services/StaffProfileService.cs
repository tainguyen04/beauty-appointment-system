using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class StaffProfileService : IStaffProfileService
    {
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IServiceRepository _serviceRepository; 
        private readonly IMapper _mapper;
        public StaffProfileService(IStaffProfileRepository staffProfileRepository, IMapper mapper, IServiceRepository serviceRepository)
        {
            _staffProfileRepository = staffProfileRepository;
            _mapper = mapper;
            _serviceRepository = serviceRepository;
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var staffProfile = await _staffProfileRepository.GetByIdAsync(id);
            if (staffProfile == null)
                return false;
            staffProfile.IsDeleted = true;
            await _staffProfileRepository.SaveChangesAsync();
            return true;
        }

        public async Task<List<StaffProfileResponse>> GetAllAsync()
        {
            return _mapper.Map<List<StaffProfileResponse>>(await _staffProfileRepository.GetAllStaffWithDetailsAsync());
        }

        public async Task<StaffProfileResponse?> GetByIdAsync(int id)
        {
            return _mapper.Map<StaffProfileResponse?>(await _staffProfileRepository.GetByIdWithDetailsAsync(id));
        }

        public async Task<StaffProfileResponse> GetByUserIdAsync(int userId)
        {
            return _mapper.Map<StaffProfileResponse>(await _staffProfileRepository.GetByUserIdAsync(userId,true));
        }
        public async Task<int> UpSertAsync(StaffProfileRequest request)
        {
            var staffProfile = await _staffProfileRepository.GetByUserIdAsync(request.UserId);

            var selectedServices = await _serviceRepository.GetRangeByIdsAsync(request.ServiceIds);
            if(selectedServices.Count() != request.ServiceIds.Count())
            {
                throw new Exception("Một hoặc nhiều dịch vụ không tồn tại.");
            }
            if (staffProfile == null)
            {
                staffProfile = _mapper.Map<StaffProfile>(request);
                staffProfile.Services = selectedServices.ToList();
                await _staffProfileRepository.CreateAsync(staffProfile);
            }
            else
            {
                _mapper.Map(request, staffProfile);
                staffProfile.Services.Clear();
                foreach (var service in selectedServices)
                {
                    staffProfile.Services.Add(service);
                }
                _staffProfileRepository.Update(staffProfile);
            }
            await _staffProfileRepository.SaveChangesAsync();
            return staffProfile.Id;
        }
    }
}
