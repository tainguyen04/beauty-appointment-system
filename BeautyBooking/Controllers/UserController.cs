using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserSerivce _userService;

        public UserController(IUserSerivce userService)
        {
            _userService = userService;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
        {
            var users = await _userService.GetAllAsync();
            if (users == null || !users.Any())
                return NoContent();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateUserRequest request)
        {
            var result = await _userService.UpdateProfileAsync(id, request);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{id}/change-password")]
        public async Task<ActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            var result = await _userService.ChangePasswordAsync(id, request);
            if (!result)
                return BadRequest("Mật khẩu hiện tại không chính xác.");
            return NoContent();
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool isActive)
        {
            var result = await _userService.UpdateStatusAsync(id, isActive);
            if (!result)
                return NotFound();
            return NoContent();
        }
        [HttpPut("{id}/role")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequest request)
        {
            if (id != request.UserId)
                return BadRequest("ID trong URL và body không khớp.");
            var result = await _userService.ChangeRoleAsync(request);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpGet("check-email")]
        public async Task<ActionResult<bool>> IsEmailAvailable([FromQuery] string email)
        {
            var available = await _userService.IsEmailAvailableAsync(email);
            if (available)
                return Conflict(new { message = "Email đã được sử dụng" });
            return Ok(available);
        }
    }
}
