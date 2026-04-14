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

        public async Task<bool> CancelAppointmentByCustomerAsync(int appointmentId)
        {
            var customerId = _currentUserService.UserId;
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            if (appointment == null || appointment.IsDeleted)
                throw new Exception("Không tìm thấy cuộc hẹn");
            if (appointment.UserId != customerId)
                throw new UnauthorizedAccessException("Bạn không có quyền hủy cuộc hẹn này.");
            if (appointment.AppointmentStatus == AppointmentStatus.Cancelled)
                throw new InvalidOperationException("Cuộc hẹn đã bị hủy.");
            appointment.AppointmentStatus = AppointmentStatus.Cancelled;
            await _appointmentRepository.SaveChangesAsync();
            return true;

        }


        public async Task<int> CreateAppointmentByAdminAsync(CreateAppointmentRequest request)
        {
            if (request.ServiceIds == null || !request.ServiceIds.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");
            var distinctServiceIds = request.ServiceIds.Distinct().ToList();
            var services = (await _serviceRepository.GetRangeByIdsAsync(distinctServiceIds)).ToList();
            if (services.Count() != distinctServiceIds.Count())
                throw new InvalidOperationException("Một hoặc nhiều dịch vụ không tồn tại.");

            var appointment = _mapper.Map<Appointment>(request);
            appointment.AppointmentStatus = AppointmentStatus.Confirmed;
            int totalDuration = services.Sum(s => s.Duration);
            appointment.EndTime = request.StartTime + totalDuration;

            ApplyServicesToAppointment(appointment, services);

            await ValidateAsync(
                appointment.StaffId, 
                appointment.AppointmentDate, 
                appointment.StartTime,
                appointment.EndTime, 
                request.ServiceIds);

            await _appointmentRepository.CreateAsync(appointment);
            await _appointmentRepository.SaveChangesAsync();
            return appointment.Id;
        }

        public async Task<int> CreateAppointmentByCustomerAsync(CreateAppointmentRequest request)
        {
            
            var appointment = _mapper.Map<Appointment>(request);
            var userId = _currentUserService.UserId;
            if(!userId.HasValue)
                throw new Exception("Không tìm thấy người dùng");
            appointment.UserId = userId.Value;
            appointment.AppointmentStatus = AppointmentStatus.Pending;
            var distinctServiceIds = request.ServiceIds.Distinct().ToList();
            var services = (await _serviceRepository.GetRangeByIdsAsync(distinctServiceIds)).ToList();
            if (services.Count() != distinctServiceIds.Count())
                throw new InvalidOperationException("Một hoặc nhiều dịch vụ không tồn tại.");
            if(services == null || !services.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");
            int totalDuration = services.Sum(s => s.Duration);
            appointment.EndTime = request.StartTime + totalDuration;

            ApplyServicesToAppointment(appointment, services);
            await ValidateAsync(
                appointment.StaffId,
                appointment.AppointmentDate,
                appointment.StartTime,
                appointment.EndTime,
                request.ServiceIds);

            await _appointmentRepository.CreateAsync(appointment);
            await _appointmentRepository.SaveChangesAsync();
            return appointment.Id;
        }

        public async Task<bool> DeleteAppointmentAsync(int id)
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
            if(userRole == UserRole.Customer)
            {
                var userId = _currentUserService.UserId;
                query = query.Where(a => a.UserId == userId);
            }
            else if (userRole == UserRole.Staff)
            {
                var staffId = _currentUserService.StaffId;
                query = query.Where(a => a.StaffId == staffId);
            }
            var keyword = filter.Keyword?.Trim();

            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(a => a.User.FullName.Contains(keyword) ||
                                         a.Staff.User.FullName.Contains(keyword));

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
            var appointment = await _appointmentRepository.GetByIdAsync(id);
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

        public async Task<PagedResult<AppointmentResponse>> GetMyAppointmentsAsync(int pageNumber, int pageSize)
        {
            var customerId = _currentUserService.UserId;
            if (!customerId.HasValue)
                throw new UnauthorizedAccessException("Người dùng chưa đăng nhập");

            var pagedAppointments = await _appointmentRepository.GetAppointmentsByUserIdAsync(customerId.Value, pageNumber, pageSize);
            return pagedAppointments.ToPagedResult<Appointment, AppointmentResponse>(_mapper);
        }

        public async Task<IEnumerable<AppointmentResponse>> GetMyScheduleAsync(DateOnly date)
        {
            var staffId = _currentUserService.StaffId;
            if(!staffId.HasValue)
                throw new UnauthorizedAccessException("Nhân viên chưa đăng nhập");
            return _mapper.Map<IEnumerable<AppointmentResponse>>(await _appointmentRepository.GetAppointmentsByStaffIdAsync(staffId.Value, date));
        }
        

        public async Task<bool> UpdateAppointmentAsync(int id, UpdateAppointmentRequest request)
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

            await ValidateAsync(
                appointment.StaffId, 
                appointment.AppointmentDate, 
                appointment.StartTime, 
                appointment.EndTime, 
                request.ServiceIds, 
                appointment.Id);

            ApplyServicesToAppointment(appointment, services);
            await _appointmentRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, AppointmentStatus status)
        {
            var userRole = _currentUserService.Role;
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
                if (appointment.StaffId != _currentUserService.StaffId)
                    throw new UnauthorizedAccessException("Bạn không có quyền cập nhật lịch hẹn này.");
                appointment.AppointmentStatus = status;
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
            if (startTime >= endTime)
                throw new InvalidOperationException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");

            if (serviceIds == null || !serviceIds.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");

            var staffServiceIds = await _staffProfileRepository.GetServiceIdsByIdAsync(staffId);

            var unqualifiedServiceIds = serviceIds.Except(staffServiceIds).ToList();
            if (unqualifiedServiceIds.Any())
                throw new InvalidOperationException($"Nhân viên không thực hiện các dịch vụ có ID: {string.Join(", ", unqualifiedServiceIds)}");

            var isOff = await _staffDayOffRepository.IsAlreadyOffAsync(staffId, date);
            if (isOff)
                throw new InvalidOperationException("Nhân viên đã nghỉ vào ngày này.");

            var dayOfWeek = date.DayOfWeek;
            var schedules = await _workScheduleRepository.GetByStaffIdAndDayOfWeekAsync(staffId, dayOfWeek);
            if (schedules == null || !schedules.Any())
                throw new InvalidOperationException("Nhân viên không có lịch làm việc trong ngày này.");

            bool isWithinSchedule = schedules.Any(s =>startTime >= s.StartTime && endTime <= s.EndTime);
            if (!isWithinSchedule)
                throw new InvalidOperationException("Thời gian hẹn không nằm trong lịch làm việc.");
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
