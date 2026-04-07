using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffDayOffRepository: IRepository<StaffDayOff, int>
    {
        Task<bool> IsAlreadyOffAsync(int staffId, DateOnly date);
        IQueryable<StaffDayOff> GetByStaffId(int staffId, StaffDayOffStatus status);
        IQueryable<StaffDayOff> GetPendingDayOff();
        Task<StaffDayOff?> GetByIdWithStaffAsync(int id);
        IQueryable<StaffDayOff> GetAllByMonth(int month, int year, StaffDayOffStatus status);
        IQueryable<StaffDayOff> QueryDetailed();
        Task<List<int>> GetStaffIdsOffByDateAsync(DateOnly date);
    }
}
