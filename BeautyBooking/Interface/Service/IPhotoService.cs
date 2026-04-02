using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.Interface.Service
{
    public interface IPhotoService
    {
        Task<PhotoResponse> UploadPhotoAsync(IFormFile file, bool avatarUrl = false);
        Task<string> DeletePhotoAsync(string publicId);
    }
}
