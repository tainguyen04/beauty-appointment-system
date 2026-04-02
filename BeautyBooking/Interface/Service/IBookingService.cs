using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IBookingService
    {
        //Admin
        Task<PagedResult<AppointmentResponse>> GetAllWithDetailedAsync(int pageNumber, int pageSize);
        Task<int> CreateAppointmentByAdminAsync(CreateAppointmentRequest request);
        Task<bool> UpdateAppointmentAsync(int id, UpdateAppointmentRequest request);
        Task<bool> UpdateStatusAsync(int id, AppointmentStatus status);
        
        Task<bool> DeleteAppointmentAsync(int id);
        //User

        Task<PagedResult<AppointmentResponse>> GetMyAppointmentsAsync(int pageNumber, int pageSize);

        Task<int> CreateAppointmentByCustomerAsync(CreateAppointmentRequest request);
        Task<bool> CancelAppointmentByCustomerAsync(int appointmentId);
        //Staff

        Task<IEnumerable<AppointmentResponse>> GetMyScheduleAsync(DateOnly date);
        
        Task<bool> UpdateStatusByStaffAsync(int id, AppointmentStatus status);
        //Common
        Task<AppointmentResponse?> GetByIdWithDetailsAsync(int id);
    }
}
