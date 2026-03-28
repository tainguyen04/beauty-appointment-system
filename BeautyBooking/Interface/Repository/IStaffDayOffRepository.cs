using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffDayOffRepository: IRepository<StaffDayOff, int>
    {
        Task<bool> IsAlreadyOffAsync(int staffId, DateOnly date);
        Task<List<StaffDayOff>> GetByStaffIdAsync(int staffId);
        Task<IEnumerable<StaffDayOff>> GetPendingDayOffAsync();
        Task<StaffDayOff?> GetByIdWithStaffAsync(int id);
        Task<IEnumerable<StaffDayOff>> GetAllByMonthAsync(int month, int year);
        Task<IEnumerable<StaffDayOff>> GetAllWithStaffAsync();
    }
}
