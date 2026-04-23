using AutoMapper;
using AutoMapper.QueryableExtensions;
using Azure.Core;
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
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IStaffDayOffRepository _staffDayOffRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IWorkScheduleRepository _workScheduleRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public AppointmentService(IAppointmentRepository appointmentRepository,
            IMapper mapper, IStaffDayOffRepository staffDayOffRepository, IServiceRepository serviceRepository,
            IStaffProfileRepository staffProfileRepository,
            ICurrentUserService currentUserService, IWorkScheduleRepository workScheduleRepository)
        {
            _appointmentRepository = appointmentRepository;
            _mapper = mapper;
            _staffDayOffRepository = staffDayOffRepository;
            _serviceRepository = serviceRepository;
            _staffProfileRepository = staffProfileRepository;
            _currentUserService = currentUserService;
            _workScheduleRepository = workScheduleRepository;
        }
        public async Task<int> CreateAsync(CreateAppointmentRequest request)
        {
            var userId = _currentUserService.UserId;
            var role = _currentUserService.Role;
            if (request.ServiceIds == null || !request.ServiceIds.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");
            if(role == UserRole.Customer)
            {
                request.UserId = userId;
            }
            if(role != UserRole.Admin && request.UserId != userId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền tạo lịch hẹn cho người khác.");
            }
            var distinctServiceIds = request.ServiceIds.Distinct().ToList();
            var services = (await _serviceRepository.GetRangeByIdsAsync(distinctServiceIds)).ToList();
            if (services.Count() != distinctServiceIds.Count())
                throw new InvalidOperationException("Một hoặc nhiều dịch vụ không tồn tại.");

            var appointment = _mapper.Map<Appointment>(request);
            var status = role == UserRole.Customer ? AppointmentStatus.Pending : AppointmentStatus.Confirmed;
            appointment.AppointmentStatus = status;
            int totalDuration = services.Sum(s => s.Duration);
            appointment.EndTime = request.StartTime + totalDuration;

            ApplyServicesToAppointment(appointment, services);
            if(appointment.StaffId.HasValue && appointment.StaffId > 0)
            {
                await ValidateAsync(
                appointment.StaffId.Value,
                appointment.AppointmentDate,
                appointment.StartTime,
                appointment.EndTime,
                request.ServiceIds);
            }

            await _appointmentRepository.CreateAsync(appointment);
            await _appointmentRepository.SaveChangesAsync();
            return appointment.Id;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
            {
                return false;
            }
            appointment.IsDeleted = true;

            await _appointmentRepository.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<AppointmentResponse>> GetAppointmentsAsync(AppointmentFilter filter)
        {
            var query = _appointmentRepository.Query();
            var userRole = _currentUserService.Role;
            if (userRole == UserRole.Customer)
            {
                query = query.Where(a => a.UserId == _currentUserService.UserId);
            }
            else if (userRole == UserRole.Staff)
            {
                query = query.Where(a => a.StaffId == _currentUserService.StaffId);
            }


            if(filter.UserId.HasValue)
                query = query.Where(a => a.UserId == filter.UserId.Value);

            if (filter.StaffId.HasValue)
                query = query.Where(a => a.StaffId == filter.StaffId.Value);

            if(filter.WardId.HasValue)
                query = query.Where(a => a.WardId == filter.WardId.Value);

            var keyword = filter.Keyword?.Trim();

            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(a => a.User.FullName.Contains(keyword) ||
                                         (a.Staff != null && a.Staff.User.FullName.Contains(keyword)));

            if (filter.FromDate.HasValue)
                query = query.Where(a => a.AppointmentDate >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(a => a.AppointmentDate <= filter.ToDate.Value);

            if (filter.Status.HasValue)
                query = query.Where(a => a.AppointmentStatus == filter.Status.Value);
            return await query
                .OrderByDescending(a => a.AppointmentDate)
                .ProjectTo<AppointmentResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);

        }

        public async Task<AppointmentResponse?> GetByIdWithDetailsAsync(int id)
        {
            var appointment = await _appointmentRepository.GetDetailedByIdAsync(id);
            if (appointment == null)
                throw new InvalidOperationException("Không tìm thấy lịch hẹn");

            var userId = _currentUserService.UserId;
            var staffId = _currentUserService.StaffId;
            var userRole = _currentUserService.Role;

            if (userRole == UserRole.Customer && appointment.UserId != userId)
                throw new UnauthorizedAccessException("Bạn không có quyền xem lịch hẹn người khác");

            if (userRole == UserRole.Staff && appointment.StaffId != staffId)
                throw new UnauthorizedAccessException("Bạn không có quyền xem lịch hẹn của nhân viên khác");

            return _mapper.Map<AppointmentResponse?>(await _appointmentRepository.GetDetailedByIdAsync(id));
        }

        public async Task<bool> UpdateAsync(int id, UpdateAppointmentRequest request)
        {
            var appointment = await _appointmentRepository.GetDetailedByIdAsync(id);
            if (appointment == null)
                return false;

            if (appointment.AppointmentStatus == AppointmentStatus.Cancelled)
                throw new InvalidOperationException("Không thể cập nhật lịch bị hủy.");
            if (request.ServiceIds == null || !request.ServiceIds.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");

            var distinctServiceIds = request.ServiceIds.Distinct().ToList();
            var services = (await _serviceRepository.GetRangeByIdsAsync(distinctServiceIds)).ToList();

            if (services.Count() != distinctServiceIds.Count())
                throw new InvalidOperationException("Một hoặc nhiều dịch vụ không tồn tại.");

            _mapper.Map(request, appointment);
            int newtotalDuration = services.Sum(s => s.Duration);
            appointment.StartTime = request.StartTime;
            appointment.EndTime = request.StartTime + newtotalDuration;
            if (appointment.StaffId.HasValue && appointment.StaffId > 0)
            {
                await ValidateAsync(
                appointment.StaffId.Value,
                appointment.AppointmentDate,
                appointment.StartTime,
                appointment.EndTime,
                request.ServiceIds,
                appointment.Id);
            }

            ApplyServicesToAppointment(appointment, services);
            await _appointmentRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, AppointmentStatus status)
        {
            var userRole = _currentUserService.Role;
            var userId = _currentUserService.UserId;
            var staffId = _currentUserService.StaffId;
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                throw new Exception("Không tìm thấy lịch hẹn");

            if (appointment.AppointmentStatus == AppointmentStatus.Cancelled)
                throw new InvalidOperationException("Không thể cập nhật lịch bị hủy.");

            if (userRole == UserRole.Admin)
            {
                // Admin có thể cập nhật tất cả lịch hẹn
                appointment.AppointmentStatus = status;
            }
            else if (userRole == UserRole.Staff)
            {
                if (appointment.StaffId != staffId)
                    throw new UnauthorizedAccessException("Bạn không có quyền cập nhật lịch hẹn này.");
                if(status != AppointmentStatus.Confirmed && status != AppointmentStatus.Completed)
                    throw new InvalidOperationException("Bạn chỉ có thể xác nhận hoặc hoàn thành lịch hẹn.");
                if (status == AppointmentStatus.Confirmed)
                {
                    if (appointment.AppointmentStatus != AppointmentStatus.Pending)
                        throw new InvalidOperationException("Chỉ xác nhận từ trạng thái chờ.");
                }
                else if (status == AppointmentStatus.Completed)
                {
                    if (appointment.AppointmentStatus != AppointmentStatus.Confirmed)
                        throw new InvalidOperationException("Chỉ hoàn thành khi đã xác nhận.");
                }
                appointment.AppointmentStatus = status;
            }
            else if(userRole == UserRole.Customer)
            {
                if (appointment.UserId != userId)
                    throw new UnauthorizedAccessException("Bạn không có quyền cập nhật lịch hẹn này.");
                if (status != AppointmentStatus.Cancelled)
                    throw new InvalidOperationException("Bạn chỉ có thể hủy lịch hẹn.");
                if (appointment.AppointmentStatus != AppointmentStatus.Pending)
                    throw new InvalidOperationException("Chỉ có thể hủy lịch hẹn đang ở trạng thái chờ.");
                    var ExpiryDate = appointment.AppointmentDate.AddDays(-1);
                    if (DateOnly.FromDateTime(DateTime.UtcNow) > ExpiryDate)
                        throw new InvalidOperationException("Chỉ có thể hủy lịch hẹn trước 1 ngày.");
                appointment.AppointmentStatus = AppointmentStatus.Cancelled;
            }
            else
            {
                throw new UnauthorizedAccessException("Bạn không có quyền cập nhật lịch hẹn này.");
            }

            await _appointmentRepository.SaveChangesAsync();
            return true;
        }

        private void ApplyServicesToAppointment(Appointment appointment, IEnumerable<Service> services)
        {
            if (services == null || !services.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");
            var serviceList = services.ToList();
            appointment.TotalPrice = serviceList.Sum(s => s.Price);
            appointment.AppointmentServices.Clear();

            // Dùng foreach để Add giúp EF Core tracking tốt nhất
            foreach (var service in serviceList)
            {
                appointment.AppointmentServices.Add(new Entities.AppointmentService
                {
                    ServiceId = service.Id,
                    PriceAtBooking = service.Price,
                    DurationAtBooking = service.Duration,
                });
            }
        }
        private async Task ValidateAsync(int staffId, DateOnly date, int startTime, int endTime, List<int> serviceIds, int? excludeId = null)
        {
            ValidateTimeRange(startTime, endTime);
            await ValidateServicesAsync(staffId, serviceIds);
            await ValidateStaffAvailabilityAsync(staffId, date);
            await ValidateOverlapAsync(staffId, date, startTime, endTime, excludeId);
        }
        private void ValidateTimeRange(int startTime, int endTime)
        {
            if (startTime >= endTime)
                throw new InvalidOperationException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
        }
        private async Task ValidateServicesAsync(int staffId, List<int> serviceIds)
        {
            if (serviceIds == null || !serviceIds.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");
            var staffServiceIds = await _staffProfileRepository.GetServiceIdsByIdAsync(staffId);
            var unqualifiedServiceIds = serviceIds.Except(staffServiceIds).ToList();
            if (unqualifiedServiceIds.Any())
                throw new InvalidOperationException($"Nhân viên không thực hiện các dịch vụ có ID: {string.Join(", ", unqualifiedServiceIds)}");
        }
        private async Task ValidateStaffAvailabilityAsync(int staffId, DateOnly date)
        {
            var isOff = await _staffDayOffRepository.IsAlreadyOffAsync(staffId, date);
            if (isOff)
                throw new InvalidOperationException("Nhân viên đã nghỉ vào ngày này.");
            var dayOfWeek = date.DayOfWeek;
            var schedules = await _workScheduleRepository.GetByStaffIdAndDayOfWeekAsync(staffId, dayOfWeek);
            if (schedules == null || !schedules.Any())
                throw new InvalidOperationException("Nhân viên không có lịch làm việc trong ngày này.");
        }
        private async Task ValidateOverlapAsync(int staffId, DateOnly date, int startTime, int endTime, int? excludeId = null)
        {
            var hasOverlap = await _appointmentRepository.HasOverlapAsync(
                staffId,
                date,
                startTime,
                endTime,
                excludeId
            );
            if (hasOverlap)
                throw new InvalidOperationException("Nhân viên đã có lịch trùng trong khung giờ này.");
        }
    }

}
