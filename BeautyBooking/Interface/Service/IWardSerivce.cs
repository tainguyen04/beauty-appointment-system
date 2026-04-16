using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IWardSerivce
    {
        Task<bool> CreateAsync(string key,CreateWardRequest request);
        Task<bool> UpdateAsync(int wardId,UpdateWardRequest request);
        Task<bool> DeleteAsync(int wardId); 


        Task<IEnumerable<WardResponse>> GetAllAsync();
        Task<WardResponse?> GetByIdAsync(int wardId);
    }
}
