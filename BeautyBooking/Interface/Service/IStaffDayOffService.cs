using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IStaffDayOffService
    {
        Task<int> CreateAsync(StaffDayOffRequest staffDayOff);
        Task<IEnumerable<StaffDayOffResponse>> GetAllByMonthAsync(int month, int year);
        Task<IEnumerable<StaffDayOffResponse>> GetAllWithStaffAsync();
        Task<StaffDayOffResponse?> GetByIdAsync(int id);
        Task<IEnumerable<StaffDayOffResponse>> GetMyHistoryAsync(int staffId);
        Task<bool> CancelAsync(int id);
        Task<bool> ApproveAsync(int id);
        Task<IEnumerable<StaffDayOffResponse>> GetPendingDayOffAsync();
        Task<bool> RejectAsync(int id);
    }
}
