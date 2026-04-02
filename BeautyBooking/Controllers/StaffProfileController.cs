using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
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
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<PagedResult<StaffProfileResponse>>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _staffProfileService.GetAllAsync(pageNumber, pageSize);
            return Ok(result);
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

        [HttpGet("service/{serviceId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<StaffProfileResponse>>> GetByServiceId(int serviceId)
        {
            var staff = await _staffProfileService.GetByServiceIdAsync(serviceId);
            return Ok(staff);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<int>> Create([FromBody] CreateStaffProfileRequest request)
        {
            var id = await _staffProfileService.CreateAsync(request);
            var createdStaff = await _staffProfileService.GetByIdAsync(id);

            return CreatedAtAction(nameof(GetById), new { id }, createdStaff);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffProfileRequest request)
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
        [Authorize]
        public async Task<ActionResult<IEnumerable<StaffProfileResponse>>> GetAvailable([FromQuery] DateOnly date, [FromQuery] int startTime, [FromQuery] int endTime)
        {
            var staff = await _staffProfileService.GetAvailableAsync(date, startTime, endTime);
            return Ok(staff);
        }
    }
}
