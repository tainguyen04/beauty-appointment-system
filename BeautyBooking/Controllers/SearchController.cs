using BeautyBooking.DTO.Filter;
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
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet("appointments")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<PagedResult<AppointmentResponse>>> GetAppointments([FromQuery] AppointmentFilter filter)
        {
            var result = await _searchService.SearchAppointmentsAsync(filter);
            return Ok(result);
        }

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetCategories([FromQuery] CategoryFilter filter)
        {
            var result = await _searchService.SearchCategoriesAsync(filter);
            return Ok(result);
        }

        [HttpGet("services")]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<ServiceResponse>>> GetServices([FromQuery] ServiceFilter filter)
        {
            var result = await _searchService.SearchServicesAsync(filter);
            return Ok(result);
        }

        [HttpGet("staff-profiles")]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<StaffProfileResponse>>> GetStaffProfiles([FromQuery] StaffProfileFilter filter)
        {
            var result = await _searchService.SearchStaffProfilesAsync(filter);
            return Ok(result);
        }

        [HttpGet("users")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<PagedResult<UserResponse>>> GetUsers([FromQuery] UserFilter filter)
        {
            var result = await _searchService.SearchUsersAsync(filter);
            return Ok(result);
        }

        [HttpGet("work-schedules")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<PagedResult<WorkScheduleResponse>>> GetWorkSchedules([FromQuery] WorkScheduleFilter filter)
        {
            var result = await _searchService.SearchWorkSchedulesAsync(filter);
            return Ok(result);
        }

        [HttpGet("staff-day-offs")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<PagedResult<StaffDayOffResponse>>> GetStaffDayOffs([FromQuery] StaffDayOffFilter filter)
        {
            var result = await _searchService.SearchStaffDayOffsAsync(filter);
            return Ok(result);
        }
    }
}
