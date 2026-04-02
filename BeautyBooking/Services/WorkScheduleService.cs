using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using BeautyBooking.MappingProfiles;

namespace BeautyBooking.Services
{
    public class WorkScheduleService : IWorkScheduleService
    {
        private readonly IWorkScheduleRepository _workScheduleRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IMapper _mapper;
        public WorkScheduleService(IWorkScheduleRepository workScheduleRepository, IStaffProfileRepository staffProfileRepository, IMapper mapper)
        {
            _workScheduleRepository = workScheduleRepository;
            _staffProfileRepository = staffProfileRepository;
            _mapper = mapper;
        }
        public async Task<int> CreateAsync(CreateWorkScheduleRequest request)
        {
            var staff = await _staffProfileRepository.GetByIdAsync(request.StaffId);
            if (staff == null || staff.IsDeleted)
                throw new ArgumentException("ID không tồn tại.");
            if(await _workScheduleRepository.HasOverlapAsync(request.StaffId, request.DayOfWeek, request.StartTime, request.EndTime))
                throw new InvalidOperationException("Ca làm việc này bị trùng lặp thời gian với ca khác.");
            if (request.StartTime >= request.EndTime)
                throw new InvalidOperationException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
            var workSchedule = _mapper.Map<WorkSchedule>(request);
            await _workScheduleRepository.CreateAsync(workSchedule);
            await _workScheduleRepository.SaveChangesAsync();
            return workSchedule.Id;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var workSchedule = await _workScheduleRepository.GetByIdAsync(id);
            if (workSchedule == null || workSchedule.IsDeleted)
                return false;
            _workScheduleRepository.Delete(workSchedule);
            await _workScheduleRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<WorkScheduleResponse>> GetByDayOfWeekAsync(DayOfWeek dayOfWeek)
        {
            return _mapper.Map<IEnumerable<WorkScheduleResponse>>(await _workScheduleRepository.GetAllSchedulesByDayOfWeekAsync(dayOfWeek));
        }

        public async Task<WorkScheduleResponse?> GetDetailedByIdAsync(int id)
        {
            return _mapper.Map<WorkScheduleResponse?>(await _workScheduleRepository.GetDetailedByIdAsync(id));
        }

        public async Task<IEnumerable<WorkScheduleResponse>> GetByStaffIdAndDayOfWeekAsync(int staffId, DayOfWeek dayOfWeek)
        {
            var staff = await _staffProfileRepository.GetByIdAsync(staffId);
            if (staff == null || staff.IsDeleted)
                throw new ArgumentException("ID không tồn tại.");
            return _mapper.Map<IEnumerable<WorkScheduleResponse>>(await _workScheduleRepository.GetByStaffIdAndDayOfWeekAsync(staffId, dayOfWeek));
        }

        public async Task<IEnumerable<WorkScheduleResponse>> GetByStaffIdAsync(int staffId)
        {
            var staff = await _staffProfileRepository.GetByIdAsync(staffId);
            if (staff == null || staff.IsDeleted)
                throw new ArgumentException("ID không tồn tại.");
            return _mapper.Map<IEnumerable<WorkScheduleResponse>>(await _workScheduleRepository.GetByStaffIdAsync(staffId));
        }

        public async Task<bool> UpdateAsync(int id, UpdateWorkScheduleRequest request)
        {
            var workSchedule = await _workScheduleRepository.GetByIdAsync(id);
            if (workSchedule == null || workSchedule.IsDeleted)
                return false;
            if(await _workScheduleRepository.HasOverlapAsync(workSchedule.StaffId, request.DayOfWeek, request.StartTime, request.EndTime, id))
                throw new InvalidOperationException("Ca làm việc này bị trùng lặp thời gian với ca khác.");
            if(request.StartTime >= request.EndTime)
                throw new InvalidOperationException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
            _mapper.Map(request, workSchedule);
            await _workScheduleRepository.SaveChangesAsync();
            return true;

        }

        public async Task<PagedResult<WorkScheduleResponse>> GetAllAsync(int pageNumber, int pageSize)
        {
            var pageSchedules = await _workScheduleRepository.GetAllSchedulesAsync(pageNumber, pageSize);
            return pageSchedules.ToPagedResult<WorkSchedule, WorkScheduleResponse>(_mapper);
        }
    }
}
