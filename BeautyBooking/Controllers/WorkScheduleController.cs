using BeautyBooking.DTO.Filter;
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
    public class WorkScheduleController : ControllerBase
    {
        private readonly IWorkScheduleService _workScheduleService;

        public WorkScheduleController(IWorkScheduleService workScheduleService)
        {
            _workScheduleService = workScheduleService;
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Create([FromBody] CreateWorkScheduleRequest request)
        {
            var id = await _workScheduleService.CreateAsync(request);
            var schedule = await _workScheduleService.GetDetailedByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, schedule);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateWorkScheduleRequest request)
        {
            await _workScheduleService.UpdateAsync(id, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Delete(int id)
        {
            await _workScheduleService.DeleteAsync(id);
            return NoContent();
        }

        //[HttpGet]
        //[Authorize(Policy = "AdminOnly")]
        //public async Task<ActionResult<PagedResult<WorkScheduleResponse>>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        //{
        //    var result = await _workScheduleService.GetAllAsync(pageNumber, pageSize);
        //    return Ok(result);
        //}
        [HttpGet]
        [Authorize(Policy = "AdminOnly,StaffOnly")]
        public async Task<IActionResult> GetAll([FromQuery] WorkScheduleFilter filter)
        {
            var result = await _workScheduleService.GetWorkSchedulesAsync(filter);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<WorkScheduleResponse>> GetById(int id)
        {
            var schedule = await _workScheduleService.GetDetailedByIdAsync(id);
            if (schedule == null)
                return NotFound();
            return Ok(schedule);
        }
        
        [HttpGet("me")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult<IEnumerable<WorkScheduleResponse>>> GetMySchedule()
        {
            var schedules = await _workScheduleService.GetMyScheduleAsync();
            return Ok(schedules);
        }

        [HttpGet("me/schedule/{dayOfWeek}")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult<IEnumerable<WorkScheduleResponse>>> GetMyScheduleByDay(DayOfWeek dayOfWeek)
        {
            var schedules = await _workScheduleService.GetMyScheduleByDayAsync(dayOfWeek);
            return Ok(schedules);
        }

        [HttpGet("day/{dayOfWeek}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<IEnumerable<WorkScheduleResponse>>> GetByDayOfWeek(DayOfWeek dayOfWeek)
        {
            var schedules = await _workScheduleService.GetByDayOfWeekAsync(dayOfWeek);
            return Ok(schedules);
        }
        [HttpGet("staff/{staffId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<IEnumerable<WorkScheduleResponse>>> GetByStaffId(int staffId)
        {
            var schedules = await _workScheduleService.GetByStaffIdAsync(staffId);
            return Ok(schedules);
        }

    }
}
