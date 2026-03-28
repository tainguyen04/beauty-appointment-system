using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class StaffDayOffService : IStaffDayOffService
    {
        private readonly IStaffDayOffRepository _staffDayOffRepository;
        private readonly IMapper _mapper;
        public StaffDayOffService(IStaffDayOffRepository staffDayOffRepository, IMapper mapper)
        {
            _staffDayOffRepository = staffDayOffRepository;
            _mapper = mapper;
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

            var entity = _mapper.Map<StaffDayOff>(staffDayOff);
            entity.Status = StaffDayOffStatus.Pending;

            await _staffDayOffRepository.CreateAsync(entity);
            await _staffDayOffRepository.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<IEnumerable<StaffDayOffResponse>> GetAllByMonthAsync(int month, int year)
        {
            return _mapper.Map<IEnumerable<StaffDayOffResponse>>(await _staffDayOffRepository.GetAllByMonthAsync(month, year));
        }

        public async Task<IEnumerable<StaffDayOffResponse>> GetAllWithStaffAsync()
        {
            return _mapper.Map<IEnumerable<StaffDayOffResponse>>(await _staffDayOffRepository.GetAllWithStaffAsync());
        }

        public async Task<StaffDayOffResponse?> GetByIdAsync(int id)
        {
            if(id <= 0)
                return null;
            return _mapper.Map<StaffDayOffResponse?>(await _staffDayOffRepository.GetByIdWithStaffAsync(id));
        }

        public async Task<IEnumerable<StaffDayOffResponse>> GetMyHistoryAsync(int staffId)
        {
            if(staffId <= 0)
                return null;
            return _mapper.Map<IEnumerable<StaffDayOffResponse>>(await _staffDayOffRepository.GetByStaffIdAsync(staffId));
        }

        public async Task<IEnumerable<StaffDayOffResponse>> GetPendingDayOffAsync()
        {
            return _mapper.Map<IEnumerable<StaffDayOffResponse>>(await _staffDayOffRepository.GetPendingDayOffAsync());
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
