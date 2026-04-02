using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace BeautyBooking.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;
        public PhotoService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }

        public async Task<string> DeletePhotoAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);
            return result.Result;
        }

        public async Task<PhotoResponse> UploadPhotoAsync(IFormFile file, bool avatarUrl)
        {
            var transformation = new Transformation().Height(500).Width(500).Crop("fill");
            if(avatarUrl)
            {
                transformation.Width(800).Height(500);
                transformation.Gravity("auto");
            }
            else
            {
                transformation.Gravity("face");
            }

                var uploadResult = new ImageUploadResult();
            if(file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Transformation = transformation
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }
            return new PhotoResponse
            {
                Url = uploadResult.SecureUrl.AbsoluteUri,
                PublicId = uploadResult.PublicId
            };
        }
    }
}
