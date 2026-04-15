using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAll([FromQuery] UserFilter filter)
        {
            return Ok(await _userService.GetUsersAsync(filter));
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<UserResponse>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<UserResponse>> Create([FromBody] CreateUserRequest request)
        {
            var result = await _userService.CreateUserAsync(request);
            var createdUser = await _userService.GetByIdAsync(result);
            return CreatedAtAction(nameof(GetById), new { id = result }, createdUser);
        }

        [HttpGet("me/profile")]
        public async Task<ActionResult<UserResponse>> GetMyProfile()
        {
            var user = await _userService.GetMyProfileAsync();
            if (user == null)
                return NotFound();
            return Ok(user);
        }
        [HttpPost("{id}/reset-password")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            var result = await _userService.ResetPasswordAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{id}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool isActive)
        {
            await _userService.UpdateActiveStatusAsync(id, isActive);
            return NoContent();
        }
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateProfileByAdmin(int id, [FromForm] UpdateUserRequest request)
        {
            var result = await _userService.UpdateProfileByAdminAsync(id, request);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPut("role")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ChangeRole([FromBody] ChangeRoleRequest request)
        {
            var result = await _userService.ChangeRoleAsync(request);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }


        [HttpPut("me/profile")]
        public async Task<IActionResult> UpdateMyProfile([FromForm] UpdateUserRequest request)
        {
            var result = await _userService.UpdateMyProfileAsync(request);
            if (!result)
                return BadRequest();
            return NoContent();
        }

        [HttpPut("me/password")]
        public async Task<IActionResult> ChangeMyPassword([FromBody] ChangePasswordRequest request)
        {
            var result = await _userService.ChangeMyPasswordAsync(request);
            if (!result)
                return BadRequest();
            return NoContent();
        }
        

        [AllowAnonymous]
        [HttpGet("email-availability")]
        public async Task<ActionResult<bool>> IsEmailAvailable([FromQuery] string email)
        {
            var available = await _userService.IsEmailAvailableAsync(email);
            return Ok(available);
        }
    }
}
