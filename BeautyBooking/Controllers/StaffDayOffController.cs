using AutoMapper;
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
    public class StaffDayOffController : ControllerBase
    {
        private readonly IStaffDayOffService _staffDayOffService;

        public StaffDayOffController(IStaffDayOffService staffDayOffService)
        {
            _staffDayOffService = staffDayOffService;
        }

        [HttpPost]
        [Authorize(Policy = "StaffOrAdmin")]
        public async Task<ActionResult<int>> Create([FromBody] StaffDayOffRequest request)
        {
            var id = await _staffDayOffService.CreateAsync(request);
            var created = await _staffDayOffService.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }
        [HttpGet]
        [Authorize(Policy = "StaffOrAdmin")]
        public async Task<IActionResult> GetAllWithStaff([FromQuery] StaffDayOffFilter filter)
        {
            var result = await _staffDayOffService.GetStaffDayOffsAsync(filter);
            return Ok(result);
        }

        [HttpGet("month")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<IEnumerable<StaffDayOffResponse>>> GetAllByMonth([FromQuery] int month, [FromQuery] int year, [FromQuery] StaffDayOffStatus status)
        {
            var result = await _staffDayOffService.GetAllByMonthAsync(month, year, status);
            return Ok(result);
        }

        //[HttpGet]
        //[Authorize(Policy = "AdminOnly")]
        //public async Task<ActionResult<PagedResult<StaffDayOffResponse>>> GetAllWithStaff([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        //{
        //    var result = await _staffDayOffService.GetAllWithStaffAsync(pageNumber, pageSize);
        //    return Ok(result);
        //}

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<StaffDayOffResponse>> GetById(int id)
        {
            var dayOff = await _staffDayOffService.GetByIdAsync(id);
            if (dayOff == null)
                return NotFound();
            return Ok(dayOff);
        }

        [HttpGet("my-history")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult<IEnumerable<StaffDayOffResponse>>> GetMyHistory([FromQuery] StaffDayOffStatus status)
        {
            var result = await _staffDayOffService.GetMyHistoryAsync(status);
            return Ok(result);
        }

        [HttpPost("{id}/cancel")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> Cancel(int id)
        {
            var result = await _staffDayOffService.CancelAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Approve(int id)
        {
            var result = await _staffDayOffService.ApproveAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpGet("pending")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<IEnumerable<StaffDayOffResponse>>> GetPendingDayOff()
        {
            var result = await _staffDayOffService.GetPendingDayOffAsync();
            return Ok(result);
        }

        [HttpPost("{id}/reject")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Reject(int id)
        {
            var result = await _staffDayOffService.RejectAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
