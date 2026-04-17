using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IDashboardService
    {
        Task<DashboardResponse> GetSummary();
        Task<IEnumerable<DashboardAppointmentResponse>> GetUpcomingAppointments();
    }
}
