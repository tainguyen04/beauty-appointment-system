using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffDayOffRepository: IRepository<StaffDayOff, int>
    {
        Task<bool> IsAlreadyOffAsync(int staffId, DateOnly date);
        Task<StaffDayOff?> GetByIdWithStaffAsync(int id);
    }
}
