using AutoMapper;
using AutoMapper.QueryableExtensions;
using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Service;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Services
{
    public class SearchService : ISearchService
    {
        private readonly IRepository<Service, int> _serviceRepo;
        private readonly IRepository<User, int> _userRepo;
        private readonly IRepository<Category, int> _categoryRepo;
        private readonly IRepository<Appointment, int> _appointmentRepo;
        private readonly IRepository<StaffProfile, int> _staffRepo;
        private readonly IRepository<WorkSchedule, int> _workRepo;
        private readonly IRepository<StaffDayOff, int> _dayOffRepo;
        private readonly IMapper _mapper;
        public SearchService(IRepository<Service, int> serviceRepo, 
            IRepository<User, int> userRepo, IRepository<Category, int> categoryRepo, 
            IRepository<Appointment, int> appointmentRepo, IRepository<StaffProfile, int> staffRepo, 
            IRepository<WorkSchedule, int> workRepo, IRepository<StaffDayOff, int> dayOffRepo, IMapper mapper)
        {
            _serviceRepo = serviceRepo;
            _userRepo = userRepo;
            _categoryRepo = categoryRepo;
            _appointmentRepo = appointmentRepo;
            _staffRepo = staffRepo;
            _workRepo = workRepo;
            _dayOffRepo = dayOffRepo;
            _mapper = mapper;
        }
        public async Task<PagedResult<AppointmentResponse>> SearchAppointmentsAsync(AppointmentFilter filter)
        {
            var query = _appointmentRepo.Query();
            if(!string.IsNullOrWhiteSpace(filter.Keyword))
                query = query.Where(a => a.User.FullName.Contains(filter.Keyword.Trim()) ||
                                         a.Staff.User.FullName.Contains(filter.Keyword.Trim()));

            if (filter.FromDate.HasValue)
                query = query.Where(a => a.AppointmentDate >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(a => a.AppointmentDate <= filter.ToDate.Value);

            if (filter.Status.HasValue)
                query = query.Where(a => a.AppointmentStatus == filter.Status.Value);

            return await query
                .OrderByDescending(a => a.AppointmentDate)
                .ProjectTo<AppointmentResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber,filter.PageSize);

        }

        public async Task<IEnumerable<CategoryResponse>> SearchCategoriesAsync(CategoryFilter filter)
        {
            var query = _categoryRepo.Query();
            if (!string.IsNullOrWhiteSpace(filter.Name))
                query = query.Where(c => c.Name.Contains(filter.Name.Trim()));
            return await query
                .OrderBy(c => c.Name)
                .ProjectTo<CategoryResponse>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<PagedResult<ServiceResponse>> SearchServicesAsync(ServiceFilter filter)
        {
            var query = _serviceRepo.Query();
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
                query = query.Where(s => s.Name.Contains(filter.Keyword.Trim()) ||
                                         s.Category.Name.Contains(filter.Keyword.Trim()));
            return await query
                .OrderBy(c => c.Name)
                .ProjectTo<ServiceResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
        }

        public async Task<PagedResult<StaffDayOffResponse>> SearchStaffDayOffsAsync(StaffDayOffFilter filter)
        {
            var query = _dayOffRepo.Query();
            if(!string.IsNullOrWhiteSpace(filter.Keyword))
                query = query.Where(d => d.Staff.User.FullName.Contains(filter.Keyword.Trim()));

            if (filter.FromDate.HasValue)
                query = query.Where(d => d.Date >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(d => d.Date <= filter.ToDate.Value);
            return await query
                .OrderByDescending(d => d.Date)
                .ProjectTo<StaffDayOffResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
        }

        public async Task<PagedResult<StaffProfileResponse>> SearchStaffProfilesAsync(StaffProfileFilter filter)
        {
            var query = _staffRepo.Query();
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
                query = query.Where(s => s.User.FullName.Contains(filter.Keyword.Trim()) ||
                                         s.Services.Any(serv => serv.Name.Contains(filter.Keyword.Trim())));
            return await query
                .OrderBy(s => s.User.FullName)
                .ProjectTo<StaffProfileResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
        }

        public async Task<PagedResult<UserResponse>> SearchUsersAsync(UserFilter filter)
        {
            var query = _userRepo.Query();
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
                query = query.Where(u => u.FullName.Contains(filter.Keyword.Trim()) ||
                                         u.Email.Contains(filter.Keyword.Trim()));
            if(filter.Role.HasValue)
                query = query.Where(u => u.Role == filter.Role.Value);
            return await query
                .OrderBy(u => u.FullName)
                .ProjectTo<UserResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
        }

        public async Task<PagedResult<WorkScheduleResponse>> SearchWorkSchedulesAsync(WorkScheduleFilter filter)
        {
            var query = _workRepo.Query();
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
                query = query.Where(w => w.Staff.User.FullName.Contains(filter.Keyword.Trim()));

            if (filter.Date.HasValue)
                query = query.Where(w => w.DayOfWeek == filter.Date.Value);
            return await query
                .OrderByDescending(w => w.DayOfWeek)
                .ProjectTo<WorkScheduleResponse>(_mapper.ConfigurationProvider)
                .ToPagedResultAsync(filter.PageNumber, filter.PageSize);
        }
    }
}
