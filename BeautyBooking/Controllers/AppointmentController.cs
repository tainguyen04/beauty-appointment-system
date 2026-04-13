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
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] AppointmentFilter filter)
        {
            var appointments = await _appointmentService.GetAppointmentsAsync(filter);
            return Ok(appointments);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AppointmentResponse>> GetById(int id)
        {
            var appointment = await _appointmentService.GetByIdWithDetailsAsync(id);
            return Ok(appointment);
        }

        [HttpGet("me/schedule")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetMySchedule([FromQuery] DateOnly date)
        {
            var schedule = await _appointmentService.GetMyScheduleAsync(date);
            return Ok(schedule);
        }

        [HttpGet("me")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult<PagedResult<AppointmentResponse>>> GetMyAppointments([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var appointments = await _appointmentService.GetMyAppointmentsAsync(pageNumber,pageSize);
            return Ok(appointments);
        }

        [HttpPost("admin")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> CreateByAdmin([FromBody] CreateAppointmentRequest request)
        {
            var id = await _appointmentService.CreateAppointmentByAdminAsync(request);
            var appointment = await _appointmentService.GetByIdWithDetailsAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, appointment);
        }

        [HttpPost("me")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult> CreateByCustomer([FromBody] CreateAppointmentRequest request)
        {
            var id = await _appointmentService.CreateAppointmentByCustomerAsync(request);
            var appointment = await _appointmentService.GetByIdWithDetailsAsync(id);
            if(appointment == null)
                return NotFound();
            return CreatedAtAction(nameof(GetById), new { id }, appointment);
        }

        [HttpPut("admin/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateAppointmentRequest request)
        {
            await _appointmentService.UpdateAppointmentAsync(id, request);
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        [Authorize(Policy = "StaffOrAdmin")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] AppointmentStatus status)
        {
            await _appointmentService.UpdateStatusAsync(id, status);
            return NoContent();
        }


        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Delete(int id)
        {
           await _appointmentService.DeleteAppointmentAsync(id);
           return NoContent();
        }

        [HttpDelete("{appointmentId}/cancel")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult> CancelByCustomer(int appointmentId)
        {
            await _appointmentService.CancelAppointmentByCustomerAsync(appointmentId);
            return NoContent();
        }
    }
}