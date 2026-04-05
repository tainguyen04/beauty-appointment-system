using AutoMapper;
using Azure.Core;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using BeautyBooking.MappingProfiles;

namespace BeautyBooking.Services
{
    public class BookingService : IBookingService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IStaffDayOffRepository _staffDayOffRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IWorkScheduleRepository _workScheduleRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public BookingService(IAppointmentRepository appointmentRepository,
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
            var services = (await _serviceRepository.GetRangeByIdsAsync(request.ServiceIds)).ToList();
            if (services.Count() != request.ServiceIds.Distinct().ToList().Count())
                throw new InvalidOperationException("Một hoặc nhiều dịch vụ không tồn tại.");
            if (services == null || !services.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");

            var appointment = _mapper.Map<Appointment>(request);
            appointment.AppointmentStatus = AppointmentStatus.Confirmed;

            ApplyServicesToAppointment(appointment, services);

            await ValidateAsync(appointment.StaffId, appointment.AppointmentDate, appointment.StartTime, appointment.EndTime, request.ServiceIds);

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
            var services = (await _serviceRepository.GetRangeByIdsAsync(request.ServiceIds)).ToList();
            if (services.Count() != request.ServiceIds.Distinct().ToList().Count())
                throw new InvalidOperationException("Một hoặc nhiều dịch vụ không tồn tại.");
            if(services == null || !services.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");
            

            ApplyServicesToAppointment(appointment, services);

            await ValidateAsync(appointment.StaffId, 
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

        public async Task<PagedResult<AppointmentResponse>> GetAllWithDetailedAsync(int pageNumber, int pageSize)
        {
            var pagedAppointments = await _appointmentRepository.GetAllDetailedAsync(pageNumber, pageSize);
            return pagedAppointments.ToPagedResult<Appointment, AppointmentResponse>(_mapper);
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
            if(!customerId.HasValue)
                throw new KeyNotFoundException("Không tìm thấy người dùng");
            var pagedAppointments = await _appointmentRepository.GetAppointmentsByUserIdAsync(customerId.Value, pageNumber, pageSize);
            return pagedAppointments.ToPagedResult<Appointment, AppointmentResponse>(_mapper);
        }

        public async Task<IEnumerable<AppointmentResponse>> GetMyScheduleAsync(DateOnly date)
        {
            var staffId = _currentUserService.StaffId;
            if(!staffId.HasValue)
                throw new KeyNotFoundException("Không tìm thấy nhân viên");
            return _mapper.Map<IEnumerable<AppointmentResponse>>(await _appointmentRepository.GetAppointmentsByStaffIdAsync(staffId.Value, date));
        }
        

        public async Task<bool> UpdateAppointmentAsync(int id, UpdateAppointmentRequest request)
        {
            var appointment = await _appointmentRepository.GetDetailedByIdAsync(id);
            if (appointment == null)
                return false;

            if (appointment.AppointmentStatus == AppointmentStatus.Cancelled)
                throw new InvalidOperationException("Không thể cập nhật lịch bị hủy.");

            var services = (await _serviceRepository.GetRangeByIdsAsync(request.ServiceIds)).ToList();
            var serviceIds = request.ServiceIds.Distinct().ToList();
            if (services.Count() != serviceIds.Count())
                throw new InvalidOperationException("Một hoặc nhiều dịch vụ không tồn tại.");
            if (services == null || !services.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");

            int newtotalDuration = services.Sum(s => s.Duration);
            int newEndTime = request.StartTime + newtotalDuration;

            await ValidateAsync(request.StaffId, request.AppointmentDate, request.StartTime, newEndTime, request.ServiceIds, appointment.Id);

            _mapper.Map(request, appointment);

            ApplyServicesToAppointment(appointment, services);

            await _appointmentRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, AppointmentStatus status)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                return false;
            appointment.AppointmentStatus = status;
            await _appointmentRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusByStaffAsync(int id, AppointmentStatus status)
        {
            var staffId = _currentUserService.StaffId;
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                throw new Exception("Không tìm thấy lịch hẹn");
            if (appointment.StaffId != staffId)
                throw new UnauthorizedAccessException("Bạn không có quyền cập nhật lịch hẹn này.");
            if (appointment.AppointmentStatus == AppointmentStatus.Cancelled)
                throw new InvalidOperationException("Không thể cập nhật lịch bị hủy.");
            appointment.AppointmentStatus = status;
            await _appointmentRepository.SaveChangesAsync();
            return true;
        }
        private void ApplyServicesToAppointment(Appointment appointment, IEnumerable<Service> services)
        {
            if (services == null || !services.Any())
                throw new InvalidOperationException("Vui lòng chọn ít nhất một dịch vụ.");
            var serviceList = services.ToList();
            int totalDuration = serviceList.Sum(s => s.Duration);
            appointment.EndTime = appointment.StartTime + totalDuration;
            appointment.TotalPrice = serviceList.Sum(s => s.Price);
            if(appointment.AppointmentServices == null)
                appointment.AppointmentServices = new List<AppointmentService>();
            else
                appointment.AppointmentServices.Clear();

            foreach (var service in serviceList)
            {
                appointment.AppointmentServices.Add(new AppointmentService
                {
                    ServiceId = service.Id,
                    PriceAtBooking = service.Price,
                    DurationAtBooking = service.Duration,
                });
            }
        }
        private async Task ValidateAsync(int staffId, DateOnly date, int startTime, int endTime, List<int> serviceIds, int? excludeId = null)
        {
            if(startTime > endTime)
                throw new InvalidOperationException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");

            var staffServiceIds = await _staffProfileRepository.GetServiceIdsByIdAsync(staffId);
            var unqualifiedServiceIds = serviceIds.Except(staffServiceIds).ToList();
            if (unqualifiedServiceIds.Any())
                throw new InvalidOperationException($"Nhân viên không thực hiện các dịch vụ có ID: {string.Join(", ", unqualifiedServiceIds)}");

            if (await _staffDayOffRepository.IsAlreadyOffAsync(staffId, date))
                throw new Exception("Nhân viên đã nghỉ vào thời gian này.");

            var dayOfWeek = date.DayOfWeek;
            var schedules = await _workScheduleRepository.GetByStaffIdAndDayOfWeekAsync(staffId, dayOfWeek);
            bool isWithinSchedule = schedules != null && schedules.Any(s => startTime >= s.StartTime && endTime <= s.EndTime);
            if (!isWithinSchedule)
                throw new InvalidOperationException("Thời gian hẹn không nằm trong lịch làm việc của nhân viên.");

            if (await _appointmentRepository.HasOverlapAsync(staffId, date, startTime, endTime, excludeId))
                throw new InvalidOperationException("Nhân viên đã có cuộc hẹn trùng vào thời gian này.");
            if (startTime >= endTime)
                throw new InvalidOperationException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
           
        }
    }
}
