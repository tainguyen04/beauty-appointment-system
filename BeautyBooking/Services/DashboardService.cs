using AutoMapper;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public DashboardService(IAppointmentRepository appointmentRepo, IUserRepository userRepo, IMapper mapper)
        {
            _appointmentRepository = appointmentRepo;
            _userRepository = userRepo;
            _mapper = mapper;
        }
        public async Task<DashboardResponse> GetSummary()
        {
            var today = DateTime.Today;
            var appointmentsCount = await _appointmentRepository.GetAppointmentsCountByDateAsync(today);
            var revenue = await _appointmentRepository.GetTotalRevenueByDateAsync(today);
            var newCustomersCount = await _userRepository.GetNewCustomersCountByDateAsync(today);
            return new DashboardResponse
            {
                ToDayAppointments = appointmentsCount,
                ToDayRevenue = revenue,
                NewCustomers = newCustomersCount
            };
        }

        public async Task<IEnumerable<DashboardAppointmentResponse>> GetUpcomingAppointments()
        {
            var appointments = await _appointmentRepository.GetTopUpcomingAsync(5);
            return _mapper.Map<IEnumerable<DashboardAppointmentResponse>>(appointments);
        }
    }
}
