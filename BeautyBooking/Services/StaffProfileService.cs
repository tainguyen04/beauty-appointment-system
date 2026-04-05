using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using BeautyBooking.MappingProfiles;
using BeautyBooking.Repository;

namespace BeautyBooking.Services
{
    public class StaffProfileService : IStaffProfileService
    {
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public StaffProfileService(IStaffProfileRepository staffProfileRepository,
            IMapper mapper, IServiceRepository serviceRepository, IUserRepository userRepository,ICurrentUserService currentUserService)
        {
            _staffProfileRepository = staffProfileRepository;
            _mapper = mapper;
            _serviceRepository = serviceRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<int> CreateAsync(CreateStaffProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new InvalidOperationException("User không tồn tại.");

            var existingProfile = await _staffProfileRepository.GetByUserIdAsync(request.UserId);
            if (existingProfile != null)
                throw new InvalidOperationException("User đã có profile nhân viên.");
            
            var staffProfile = _mapper.Map<StaffProfile>(request);
            if (request.ServiceIds != null && request.ServiceIds.Any())
            {
                var serviceIds = request.ServiceIds.Distinct().ToList();
                var services = await _serviceRepository.GetRangeByIdsAsync(serviceIds);
                if (services.Count() != serviceIds.Count())
                    throw new KeyNotFoundException("Một hoặc nhiều dịch vụ không tồn tại.");
                staffProfile.Services = services.ToList();
            }
            await _staffProfileRepository.CreateAsync(staffProfile);
            await _staffProfileRepository.SaveChangesAsync();
            return staffProfile.Id;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var staffProfile = await _staffProfileRepository.GetByIdAsync(id);
            if (staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại");
            staffProfile.IsDeleted = true;
            await _staffProfileRepository.SaveChangesAsync();
            return true;
        }
        public async Task<PagedResult<StaffProfileResponse>> GetAllAsync(int pageNumber, int pageSize)
        {
            var pagedStaffProfiles = await _staffProfileRepository.GetAllWithUserAndServicesAsync(pageNumber, pageSize);
            return pagedStaffProfiles.ToPagedResult<StaffProfile, StaffProfileResponse>(_mapper);
        }

        public async Task<IEnumerable<StaffProfileResponse>> GetAvailableAsync(DateOnly date, int startTime, int endTime)
        {
            var staffProfiles = await _staffProfileRepository.GetAvailableByTimeSlotAsync(date, startTime, endTime);
            return _mapper.Map<IEnumerable<StaffProfileResponse>>(staffProfiles);
        }

        public async Task<StaffProfileResponse?> GetByIdAsync(int id)
        {
            var staffProfile = await _staffProfileRepository.GetByIdWithUserAndServicesAsync(id);
            if (staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại.");
            var currentRole = _currentUserService.Role;
            var currentStaffId = _currentUserService.StaffId;
            if (currentStaffId != id && currentRole != UserRole.Admin)
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập thông tin của nhân viên khác.");
            return _mapper.Map<StaffProfileResponse>(staffProfile);
        }

        public async Task<IEnumerable<StaffProfileResponse>> GetByServiceIdAsync(int serviceId)
        {
            var currentRole = _currentUserService.Role;
            var currentStaffId = _currentUserService.StaffId;
            var allStaff = await _staffProfileRepository.GetByServiceIdAsync(serviceId);
            if(currentRole == UserRole.Staff)
            {
                var staffProfiles = allStaff.Where(s => s.Id == currentStaffId);
                return _mapper.Map<IEnumerable<StaffProfileResponse>>(staffProfiles);
            }
            return _mapper.Map<IEnumerable<StaffProfileResponse>>(allStaff);
        }

        public async Task<StaffProfileResponse?> GetByUserIdAsync(int userId)
        {
            var staffProfile = await _staffProfileRepository.GetByUserIdWithUserAsync(userId);
            if (staffProfile == null)
                return null;
            return _mapper.Map<StaffProfileResponse>(staffProfile);
        }

        public async Task<bool> UpdateAsync(int id, UpdateStaffProfileRequest request)
        {
            var staffProfile = await _staffProfileRepository.GetByIdWithUserAndServicesAsync(id);
            if (staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại.");

            _mapper.Map(request, staffProfile);

            if (request.ServiceIds != null && request.ServiceIds.Any())
            {
                var serviceIds = request.ServiceIds.Distinct().ToList();
                var services = await _serviceRepository.GetRangeByIdsAsync(serviceIds);
                if(services.Count() != serviceIds.Count)
                    throw new KeyNotFoundException("Một hoặc nhiều dịch vụ không tồn tại.");
                staffProfile.Services = services.ToList();
            }
            
            await _staffProfileRepository.SaveChangesAsync();
            return true;
        }
    }
}
