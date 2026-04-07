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
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Register([FromBody] CreateUserRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Created(string.Empty,result);
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (token == null)
                return BadRequest("Token không được cung cấp.");
            var result = await _authService.LogoutAsync(token);
            if (!result)
                return BadRequest();
            return NoContent();
        }
    }
}
