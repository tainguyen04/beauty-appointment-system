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
        public SearchService(IRepository<Service, int> serviceRepo, 
            IRepository<User, int> userRepo, IRepository<Category, int> categoryRepo, 
            IRepository<Appointment, int> appointmentRepo, IRepository<StaffProfile, int> staffRepo, 
            IRepository<WorkSchedule, int> workRepo, IRepository<StaffDayOff, int> dayOffRepo)
        {
            _serviceRepo = serviceRepo;
            _userRepo = userRepo;
            _categoryRepo = categoryRepo;
            _appointmentRepo = appointmentRepo;
            _staffRepo = staffRepo;
            _workRepo = workRepo;
            _dayOffRepo = dayOffRepo;
        }
        public Task<PagedResult<AppointmentResponse>> SearchAppointmentsAsync(AppointmentFilter filter)
        {
            throw new NotImplementedException();
        }

        public Task<PagedResult<CategoryResponse>> SearchCategoriesAsync(CategoryFilter filter)
        {
            throw new NotImplementedException();
        }

        public Task<PagedResult<ServiceResponse>> SearchServicesAsync(ServiceFilter filter)
        {
            throw new NotImplementedException();
        }

        public Task<PagedResult<StaffDayOffResponse>> SearchStaffDayOffsAsync(StaffDayOffFilter filter)
        {
            throw new NotImplementedException();
        }

        public Task<PagedResult<StaffProfileResponse>> SearchStaffProfilesAsync(StaffProfileFilter filter)
        {
            throw new NotImplementedException();
        }

        public Task<PagedResult<UserResponse>> SearchUsersAsync(UserFilter filter)
        {
            throw new NotImplementedException();
        }

        public Task<PagedResult<WorkScheduleResponse>> SearchWorkSchedulesAsync(WorkScheduleFilter filter)
        {
            throw new NotImplementedException();
        }
    }
}
