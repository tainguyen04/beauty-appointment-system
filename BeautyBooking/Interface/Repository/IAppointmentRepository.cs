using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IAppointmentRepository: IRepository<Appointment, int>
    {
        IQueryable<Appointment> QueryDetailed();
        IQueryable<Appointment> QueryByStaff(int staffId, DateOnly date);
        Task<bool> HasOverlapAsync(int staffId, DateOnly appointmentDate, int startTime, int endTime, int? excludeId = null);
        Task<bool> HasAnyAppointmentsAsync(int staffId, DateOnly date);
        Task<List<int>> GetBusyStaffIdsAsync(DateOnly date, int startTime, int endTime);
        Task<Appointment?> GetDetailedByIdAsync(int id);
    }
}
