using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;

namespace BeautyBooking.Interface.Service
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest request);
        Task<UserResponse> RegisterAsync(RegisterRequest request);
        Task<bool> LogoutAsync(string refreshToken);
        Task<LoginResponse?> RefreshtokenAsync(string refreshToken);
    }
}
