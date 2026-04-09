using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IStaffDayOffService
    {
        Task<int> CreateAsync(StaffDayOffRequest staffDayOff);
        Task<IEnumerable<StaffDayOffResponse>> GetAllByMonthAsync(int month, int year, StaffDayOffStatus status);
        Task<PagedResult<StaffDayOffResponse>> GetAllWithStaffAsync(int pageNumber, int pageSize);
        Task<StaffDayOffResponse?> GetByIdAsync(int id);
        Task<IEnumerable<StaffDayOffResponse>> GetMyHistoryAsync(StaffDayOffStatus status);
        Task<bool> CancelAsync(int id);
        Task<bool> ApproveAsync(int id);
        Task<IEnumerable<StaffDayOffResponse>> GetPendingDayOffAsync();
        Task<bool> RejectAsync(int id);
    }
}
