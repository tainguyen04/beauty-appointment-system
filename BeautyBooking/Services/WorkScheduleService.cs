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
    public class WorkScheduleService : IWorkScheduleService
    {
        private readonly IWorkScheduleRepository _workScheduleRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public WorkScheduleService(IWorkScheduleRepository workScheduleRepository, 
            IStaffProfileRepository staffProfileRepository, IMapper mapper, ICurrentUserService currentUserService)
        {
            _workScheduleRepository = workScheduleRepository;
            _staffProfileRepository = staffProfileRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
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
            return await _workScheduleRepository
                .GetAllSchedulesByDayOfWeek(dayOfWeek)
                .ProjectTo<WorkScheduleResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<WorkScheduleResponse?> GetDetailedByIdAsync(int id)
        {
            return _mapper.Map<WorkScheduleResponse?>(await _workScheduleRepository.GetDetailedByIdAsync(id));
        }

        public async Task<IEnumerable<WorkScheduleResponse>> GetMyScheduleByDayAsync(DayOfWeek dayOfWeek)
        {
            var staffId = _currentUserService.StaffId;
            if (staffId == null)
                throw new InvalidOperationException("Người dùng hiện tại không phải là nhân viên.");
            var staff = await _staffProfileRepository.GetByIdAsync(staffId.Value);
            return await _workScheduleRepository
                .GetByStaffIdAndDayOfWeek(staffId.Value, dayOfWeek)
                .ProjectTo<WorkScheduleResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();

        }

        public async Task<IEnumerable<WorkScheduleResponse>> GetMyScheduleAsync()
        {
            var staffId = _currentUserService.StaffId;
            if (staffId == null)
                throw new InvalidOperationException("Người dùng hiện tại không phải là nhân viên.");
            var staff = await _staffProfileRepository.GetByIdAsync(staffId.Value);
            return await _workScheduleRepository
                .GetByStaffIdAsync(staffId.Value)
                .ProjectTo<WorkScheduleResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
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
            return await _workScheduleRepository
                .Query()
                .ProjectTo<WorkScheduleResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<IEnumerable<WorkScheduleResponse>> GetByStaffIdAsync(int staffId)
        {
            var staff = await _staffProfileRepository.GetByIdAsync(staffId);
            if (staff == null || staff.IsDeleted)
                throw new ArgumentException("ID không tồn tại.");
            return await _workScheduleRepository
                .Query()
                .Where(ws => ws.StaffId == staffId)
                .ProjectTo<WorkScheduleResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }
    }
}
