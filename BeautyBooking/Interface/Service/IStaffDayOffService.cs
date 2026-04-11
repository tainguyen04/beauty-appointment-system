using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IStaffDayOffService
    {
        Task<int> CreateAsync(StaffDayOffRequest request);
        Task<StaffDayOffResponse?> GetByIdAsync(int id);
        Task<bool> CancelAsync(int id);
        Task<bool> ApproveAsync(int id);
        Task<bool> RejectAsync(int id);
        Task<bool> DeleteAsync(int id);
        Task<PagedResult<StaffDayOffResponse>> GetStaffDayOffsAsync(StaffDayOffFilter filter);
    }
}
