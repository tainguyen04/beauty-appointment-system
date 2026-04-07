using AutoMapper;
using AutoMapper.QueryableExtensions;
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
    public class StaffDayOffService : IStaffDayOffService
    {
        private readonly IStaffDayOffRepository _staffDayOffRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public StaffDayOffService(IStaffDayOffRepository staffDayOffRepository, 
            IMapper mapper, IAppointmentRepository appointmentRepository, ICurrentUserService currentUserService)
        {
            _staffDayOffRepository = staffDayOffRepository;
            _mapper = mapper;
            _appointmentRepository = appointmentRepository;
            _currentUserService = currentUserService;
        }
        public async Task<bool> ApproveAsync(int id)
        {
            var dayOff = await _staffDayOffRepository.GetByIdAsync(id);
            if (dayOff == null || dayOff.Status != StaffDayOffStatus.Pending)
                return false;
            dayOff.Status = StaffDayOffStatus.Approved;
            await _staffDayOffRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelAsync(int id)
        {
            var dayOff = await _staffDayOffRepository.GetByIdAsync(id);
            if (dayOff == null || dayOff.Status != StaffDayOffStatus.Pending)
                return false;
            dayOff.IsDeleted = true;
            await _staffDayOffRepository.SaveChangesAsync();
            return true;
        }

        public async Task<int> CreateAsync(StaffDayOffRequest staffDayOff)
        {
            if(staffDayOff.Date < DateOnly.FromDateTime(DateTime.UtcNow))
            {
                throw new Exception("Không thể xin nghỉ cho ngày đã qua");
            }
            // Check if the staff is already off on the requested date
            bool isAlreadyOff = await _staffDayOffRepository.IsAlreadyOffAsync(staffDayOff.StaffId, staffDayOff.Date);
            if (isAlreadyOff)
            {
                throw new Exception("Bạn đã xin nghỉ cho ngày này rồi");
            }
            //Goi sang BookingRepo de check xem có lịch hẹn nào đã được đặt vào ngày này chưa, nếu có thì không cho xin nghỉ
            bool hasAppointments = await _appointmentRepository.HasAnyAppointmentsAsync(staffDayOff.StaffId, staffDayOff.Date);
            if (hasAppointments)
            {
                throw new Exception("Bạn đã có lịch hẹn vào ngày này, không thể xin nghỉ");
            }
            var entity = _mapper.Map<StaffDayOff>(staffDayOff);
            entity.Status = StaffDayOffStatus.Pending;

            await _staffDayOffRepository.CreateAsync(entity);
            await _staffDayOffRepository.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<IEnumerable<StaffDayOffResponse>> GetAllByMonthAsync(int month, int year, StaffDayOffStatus status)
        {
            return await _staffDayOffRepository
                .GetAllByMonth(month,year,status)
                .ProjectTo<StaffDayOffResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<PagedResult<StaffDayOffResponse>> GetAllWithStaffAsync(int pageNumber, int pageSize)
        {
            return await _staffDayOffRepository
                .QueryDetailed()
                .ProjectTo<StaffDayOffResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<StaffDayOffResponse?> GetByIdAsync(int id)
        {
            if(id <= 0)
                throw new KeyNotFoundException("Id không tồn tại.");
            return _mapper.Map<StaffDayOffResponse?>(await _staffDayOffRepository.GetByIdWithStaffAsync(id));
        }

        public async Task<IEnumerable<StaffDayOffResponse>> GetMyHistoryAsync(int staffId, StaffDayOffStatus status)
        {
            var currentStaffId = _currentUserService.StaffId;
            if (currentStaffId != staffId)
                throw new Exception("Bạn không có quyền xem lịch sử xin nghỉ của người khác");
            var dayOffs = await _staffDayOffRepository
                .GetByStaffId(staffId, status)
                .ProjectTo<StaffDayOffResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
            if(dayOffs == null || !dayOffs.Any())
                throw new KeyNotFoundException("Không tìm thấy lịch sử xin nghỉ nào.");
            return dayOffs;
        }

        public async Task<IEnumerable<StaffDayOffResponse>> GetPendingDayOffAsync()
        {
            return await _staffDayOffRepository
                .GetPendingDayOff()
                .ProjectTo<StaffDayOffResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<bool> RejectAsync(int id)
        {
            var dayOff = await _staffDayOffRepository.GetByIdAsync(id);
            if (dayOff == null || dayOff.Status != StaffDayOffStatus.Pending)
                return false;
            dayOff.Status = StaffDayOffStatus.Rejected;
            await _staffDayOffRepository.SaveChangesAsync();
            return true;
        }
    }
}
