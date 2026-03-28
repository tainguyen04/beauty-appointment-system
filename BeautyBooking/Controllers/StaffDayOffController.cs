using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffDayOffController : ControllerBase
    {
        private readonly IStaffDayOffService _staffDayOffService;
        private readonly IMapper _mapper;

        public StaffDayOffController(IStaffDayOffService staffDayOffService, IMapper mapper)
        {
            _staffDayOffService = staffDayOffService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffDayOffResponse>>> GetAll()
        {
            var result = await _staffDayOffService.GetAllWithStaffAsync();
            if (result == null || !result.Any())
                return NoContent();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<StaffDayOffResponse>> Create([FromBody] StaffDayOffRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var staffDayOffId = await _staffDayOffService.CreateAsync(request);
            var entity = await _staffDayOffService.GetByIdAsync(staffDayOffId);
            if (entity == null)
                return NotFound();
            var response = _mapper.Map<StaffDayOffResponse>(entity);
            return CreatedAtAction(nameof(GetById), new { id = staffDayOffId }, response);
        }

        [HttpGet("month")]
        public async Task<ActionResult<IEnumerable<StaffDayOffResponse>>> GetAllByMonth([FromQuery] int month, [FromQuery] int year)
        {
            var result = await _staffDayOffService.GetAllByMonthAsync(month, year);
            if (result == null || !result.Any())
                return NoContent();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StaffDayOffResponse>> GetById(int id)
        {
            var result = await _staffDayOffService.GetByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("history/{staffId}")]
        public async Task<ActionResult<IEnumerable<StaffDayOffResponse>>> GetMyHistory(int staffId)
        {
            var result = await _staffDayOffService.GetMyHistoryAsync(staffId);
            if (result == null || !result.Any())
                return NoContent();
            return Ok(result);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var result = await _staffDayOffService.CancelAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var result = await _staffDayOffService.ApproveAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<StaffDayOffResponse>>> GetPendingDayOff()
        {
            var result = await _staffDayOffService.GetPendingDayOffAsync();
            if (result == null || !result.Any())
                return NoContent();
            return Ok(result);
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var result = await _staffDayOffService.RejectAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
