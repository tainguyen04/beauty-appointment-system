using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthController(IAuthService authService, IHttpContextAccessor httpContextAccessor)
        {
            _authService = authService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
                return Unauthorized();
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Created(string.Empty, result);
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if(!string.IsNullOrEmpty(refreshToken))
            await _authService.LogoutAsync(refreshToken);
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });
            return NoContent();
        }
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("Không tìm thấy Refresh Token");
            var result = await _authService.RefreshtokenAsync(refreshToken);
            if (result == null)
                return Unauthorized("Refresh Token không hợp lệ hoặc hết hạn");
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(new {accessToken = result.AccessToken, user = result.User});
        }
        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                Secure = true, // Chỉ dùng nếu có HTTPS
                SameSite = SameSiteMode.None // Cho phép gửi cookie trong các yêu cầu cross-site (cần thiết nếu FE và BE khác domain)
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}
