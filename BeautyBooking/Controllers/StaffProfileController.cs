using AutoMapper;
using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Interface.Service;
using BeautyBooking.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StaffProfileController : ControllerBase
    {
        private readonly IStaffProfileService _staffProfileService;
        

        public StaffProfileController(IStaffProfileService staffProfileService)
        {
            _staffProfileService = staffProfileService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] StaffProfileFilter filter)
        {
            return Ok(await _staffProfileService.GetStaffProfilesAsync(filter));
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<StaffProfileResponse>> GetById(int id)
        {
            var staff = await _staffProfileService.GetByIdAsync(id);
            if (staff == null)
                return NotFound();
            return Ok(staff);
        }

        [HttpGet("user/{userId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<StaffProfileResponse>> GetByUserId(int userId)
        {
            var staff = await _staffProfileService.GetByUserIdAsync(userId);
            if (staff == null)
                return NotFound();
            return Ok(staff);
        }
        [HttpGet("me")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult<StaffProfileResponse>> GetMyProfile()
        {
            var staff = await _staffProfileService.GetMyProfileAsync();
            if (staff == null)
                return NotFound("Bạn chưa có hồ sơ nhân viên.");
            return Ok(staff);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<int>> Create([FromForm] CreateStaffProfileRequest request)
        {
            var id = await _staffProfileService.CreateAsync(request);
            var createdStaff = await _staffProfileService.GetByIdAsync(id);

            return CreatedAtAction(nameof(GetById), new { id }, createdStaff);
        }

        [HttpPost("{id}/services")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AssignServices(int id, [FromBody] AssignServicesRequest request)
        {
            var result = await _staffProfileService.AssignServicesAsync(id, request);
            if (!result)
                return BadRequest("Không thể gán dịch vụ. Vui lòng kiểm tra lại.");
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateStaffProfileRequest request)
        {
            var result = await _staffProfileService.UpdateAsync(id, request);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _staffProfileService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpGet("available")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<StaffProfileResponse>>> GetAvailable(
            [FromQuery] DateOnly date, [FromQuery] int startTime, [FromQuery] List<int> serviceIds, [FromQuery] int wardId)
        {
            var staff = await _staffProfileService.GetAvailableAsync(date, startTime, serviceIds,wardId);
            return Ok(staff);
        }
    }
}
