using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize (Policy = "StaffOrAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("summary")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<DashboardResponse>> GetSummary()
        {
            var summary = await _dashboardService.GetSummary();
            return Ok(summary);
        }

        [HttpGet("upcoming-appointments")]
        public async Task<ActionResult<IEnumerable<DashboardAppointmentResponse>>> GetUpcomingAppointments()
        {
            var appointments = await _dashboardService.GetUpcomingAppointments();
            return Ok(appointments);
        }
    }
}
