using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IAppointmentRepository: IRepository<Appointment, int>
    {
        Task<PagedResult<Appointment>> GetPagedAsync(int pageNumber, int pageSize);
        Task<bool> HasOverlapAsync(int staffId, DateOnly appointmentDate, int startTime, int endTime, int? excludeId = null);
        Task<bool> HasAnyAppointmentsAsync(int staffId, DateOnly date);
        Task<IEnumerable<Appointment>> GetAppointmentsByStaffIdAsync(int staffId, DateOnly date);
        Task<PagedResult<Appointment>> GetAppointmentsByUserIdAsync(int userId, int pageNumber, int pageSize);
        Task<Appointment?> GetDetailedByIdAsync(int id);
        Task<int> GetAppointmentsCountByDateAsync(DateTime date);
        Task<decimal> GetTotalRevenueByDateAsync(DateTime date);
        Task<IEnumerable<Appointment>> GetTopUpcomingAsync(int count, int? staffId = null);
    }
}
