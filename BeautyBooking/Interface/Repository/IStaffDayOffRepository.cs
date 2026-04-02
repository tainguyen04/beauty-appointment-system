using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffDayOffRepository: IRepository<StaffDayOff, int>
    {
        Task<bool> IsAlreadyOffAsync(int staffId, DateOnly date);
        Task<IEnumerable<StaffDayOff>> GetByStaffIdAsync(int staffId, StaffDayOffStatus status);
        Task<IEnumerable<StaffDayOff>> GetPendingDayOffAsync();
        Task<StaffDayOff?> GetByIdWithStaffAsync(int id);
        Task<IEnumerable<StaffDayOff>> GetAllByMonthAsync(int month, int year, StaffDayOffStatus status);
        Task<PagedResult<StaffDayOff>> GetAllWithStaffAsync(int pageNumber, int pageSize);
        Task<List<int>> GetStaffIdsOffByDateAsync(DateOnly date);
    }
}
