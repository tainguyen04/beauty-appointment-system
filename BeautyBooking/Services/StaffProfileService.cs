using AutoMapper;
using AutoMapper.QueryableExtensions;
using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using BeautyBooking.MappingProfiles;
using BeautyBooking.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Services
{
    public class StaffProfileService : IStaffProfileService
    {
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPhotoService _photoService;
        private readonly IRepository<WebsiteLocalizationWard, int> _wardRepository;
        private readonly IMapper _mapper;
        public StaffProfileService(IStaffProfileRepository staffProfileRepository,
            IMapper mapper, IServiceRepository serviceRepository, IUserRepository userRepository,
            ICurrentUserService currentUserService, IPhotoService photoService, IRepository<WebsiteLocalizationWard, int> wardRepo)
        {
            _staffProfileRepository = staffProfileRepository;
            _mapper = mapper;
            _serviceRepository = serviceRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
            _photoService = photoService;
            _wardRepository = wardRepo;
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
            var ward = await _wardRepository.GetByIdAsync(request.WardId);
            if (ward == null)
                throw new KeyNotFoundException("Khu vực không tồn tại.");

            staffProfile.UserId = request.UserId;
            if (request.ServiceIds != null)
            {
                var serviceIds = request.ServiceIds.Distinct().ToList();
                var services = await _serviceRepository.GetRangeByIdsAsync(serviceIds);
                if (services.Count() != serviceIds.Count())
                    throw new KeyNotFoundException("Một hoặc nhiều dịch vụ không tồn tại.");
                staffProfile.Services = services.ToList();
            }
            string? newPublicId = null;
            if (request.AvatarUrl != null)
            {
                var photoResult = await _photoService.UploadPhotoAsync(request.AvatarUrl, true);
                await _userRepository.UpdateAvatarAsync(request.UserId, photoResult.Url, photoResult.PublicId);
            }
            try
            {
                await _staffProfileRepository.CreateAsync(staffProfile);
                await _staffProfileRepository.SaveChangesAsync();
            }
            catch
            {
                if (newPublicId != null)
                    await _photoService.DeletePhotoAsync(newPublicId);
            }
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
        public async Task<bool> UpdateActiveStatusAsync(int userId, bool isActive)
        {
            var staffProfile = await _staffProfileRepository.GetByUserIdAsync(userId);
            if (staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại");
            staffProfile.IsActive = isActive;
            await _staffProfileRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<StaffProfileResponse>> GetAvailableAsync(
            DateOnly date, int startTime, List<int> serviceIds,int? wardId = null)
        {
            if (serviceIds == null || !serviceIds.Any())
                throw new InvalidOperationException("Vui lòng chọn dịch vụ.");

            var services = await _serviceRepository.GetRangeByIdsAsync(serviceIds);
            if (services == null || !services.Any())
                throw new InvalidOperationException("Không tìm thấy dịch vụ.");
            var totalDuration = services.Sum(s => s.Duration);
            var endTime = startTime + totalDuration;
            var staffProfiles = await _staffProfileRepository.GetAvailableByTimeSlotAsync(date, startTime, endTime, serviceIds,wardId);
            return _mapper.Map<IEnumerable<StaffProfileResponse>>(staffProfiles);
        }

        public async Task<StaffProfileResponse?> GetByIdAsync(int id)
        {
            var currentRole = _currentUserService.Role;
            var currentStaffId = _currentUserService.StaffId;
            if (currentRole != UserRole.Admin  && currentStaffId != id)
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập thông tin của nhân viên khác.");
            var staffProfile =  await _staffProfileRepository
                                .Query()
                                .Where(s => s.Id == id && s.IsActive && !s.IsDeleted)
                                .ProjectTo<StaffProfileResponse>(_mapper.ConfigurationProvider)
                                .FirstOrDefaultAsync();
            if(staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại.");
            return staffProfile;
        }

        public async Task<StaffProfileResponse?> GetByUserIdAsync(int userId)
        {
            var staffProfile = await _staffProfileRepository.GetByUserIdWithUserAsync(userId);
            if (staffProfile == null)
                return null;
            var currentRole = _currentUserService.Role;
            var currentUserId = _currentUserService.UserId;
            if(currentRole == UserRole.Admin && staffProfile.UserId != currentUserId)
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập thông tin của nhân viên khác.");
            return _mapper.Map<StaffProfileResponse>(staffProfile);
        }

        public async Task<bool> UpdateAsync(int id, UpdateStaffProfileRequest request)
        {
            var staffProfile = await _staffProfileRepository.GetByIdWithUserAndServicesAsync(id);
            if (staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại.");

            var currentRole = _currentUserService.Role;
            var currentStaffId = _currentUserService.StaffId;
            if (currentRole != UserRole.Admin && currentStaffId != id)
                throw new UnauthorizedAccessException();

            _mapper.Map(request, staffProfile);

            if (request.ServiceIds != null && request.ServiceIds.Any())
            {
                var serviceIds = request.ServiceIds.Distinct().ToList();
                var services = (await _serviceRepository.GetRangeByIdsAsync(serviceIds)).ToList();
                if(services.Count != serviceIds.Count)
                    throw new KeyNotFoundException("Một hoặc nhiều dịch vụ không tồn tại.");

                staffProfile.Services = services;
            }
            string? oldAvatarPublicId = staffProfile.User.AvatarPublicId;
            if (request.AvatarUrl != null)
            {
                var photoResult = await _photoService.UploadPhotoAsync(request.AvatarUrl, true);
                await _userRepository.UpdateAvatarAsync(staffProfile.UserId, photoResult.Url, photoResult.PublicId);
            }
            await _staffProfileRepository.SaveChangesAsync();

            if (request.AvatarUrl != null && !string.IsNullOrEmpty(oldAvatarPublicId))
            {
                try
                {
                    await _photoService.DeletePhotoAsync(oldAvatarPublicId);
                }
                catch (Exception ex)
                {
                    // Log lỗi nếu cần thiết
                    Console.WriteLine($"Lỗi khi xóa ảnh cũ: {ex.Message}");
                }
            }
            return true;
        }
        public async Task<bool> AssignServicesAsync(int id, AssignServicesRequest request)
        {
            var staffProfile = await _staffProfileRepository.GetByIdWithServicesAsync(id);
            if (staffProfile == null)
                throw new KeyNotFoundException("Staff không tồn tại.");
            var currentRole = _currentUserService.Role;
            var currentStaffId = _currentUserService.StaffId;
            if (currentRole != UserRole.Admin && currentStaffId != id)
                throw new UnauthorizedAccessException();
            var services = (await _serviceRepository.GetRangeByIdsAsync(request.ServiceIds)).ToList();
            if (request.ServiceIds != null && request.ServiceIds.Any())
            {
                if (services.Count != request.ServiceIds.Distinct().Count())
                    throw new KeyNotFoundException("Một hoặc nhiều dịch vụ không tồn tại.");
                var currentServiceIds = staffProfile.Services.Select(s => s.Id).ToHashSet();
                var newServices = services.Where(s => !currentServiceIds.Contains(s.Id)).ToList();
                if (newServices.Any())
                {
                    foreach (var service in newServices)
                    {
                        staffProfile.Services.Add(service);
                    }
                }
            }    
            await _staffProfileRepository.SaveChangesAsync();
            return true;
        }

        public async Task<StaffProfileResponse?> GetMyProfileAsync()
        {
            var currentUserId = _currentUserService.UserId;
            if (!currentUserId.HasValue)
                throw new UnauthorizedAccessException("Người dùng chưa đăng nhập.");
            var staffProfile = await _staffProfileRepository.GetByUserIdAsync(currentUserId.Value);
            if (staffProfile == null)
                return null;
            return _mapper.Map<StaffProfileResponse>(staffProfile);
        }

        public async Task<PagedResult<StaffProfileResponse>> GetStaffProfilesAsync(StaffProfileFilter filter)
        {
            var query = _staffProfileRepository.Query();
            var keyword = filter.Keyword?.Trim();
            var currentRole = _currentUserService.Role;
            var currentStaffId = _currentUserService.StaffId;
            if(filter.WardId.HasValue)
                query = query.Where(s => s.WardId == filter.WardId.Value);

            if (filter.ServiceId.HasValue)
            {
                query = query.Where(s =>s.Services.Select(x => x.Id).Contains(filter.ServiceId.Value));
            }
                
            
            if (currentRole == UserRole.Staff && currentStaffId.HasValue)
                query = query.Where(s => s.Id == currentStaffId.Value);

            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(s => s.User.FullName.Contains(keyword) ||
                                         s.Services.Any(serv => serv.Name.Contains(keyword)));
            return await query
                .OrderBy(s => s.User.FullName)
                .ProjectTo<StaffProfileResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
        }
    }
}
