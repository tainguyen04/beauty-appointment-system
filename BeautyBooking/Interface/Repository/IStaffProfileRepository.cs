using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffProfileRepository : IRepository<StaffProfile, int>
    {
        Task<StaffProfile?> GetByUserIdAsync(int userId);
        Task<StaffProfile?> GetByUserIdWithUserAsync(int userId);
        Task<PagedResult<StaffProfile>> GetAllWithUserAndServicesAsync(int pageNumber, int pageSize);
        Task<PagedResult<StaffProfile>> GetByServiceIdsAsync(List<int> serviceIds, int pageNumber, int pageSize);
        Task<IEnumerable<StaffProfile>> GetByServiceIdAsync(int serviceId);
        Task<StaffProfile?> GetByIdWithUserAndServicesAsync(int id);
        Task<IEnumerable<int>> GetServiceIdsByIdAsync(int userId);
        Task<IEnumerable<StaffProfile>> GetWorkingByDateAsync(DateOnly date);
        Task<IEnumerable<StaffProfile>> GetActiveAsync();
        Task<IEnumerable<StaffProfile>> GetAvailableByTimeSlotAsync(DateOnly date, int? startTime = null, int? endTime = null);

    }
}
