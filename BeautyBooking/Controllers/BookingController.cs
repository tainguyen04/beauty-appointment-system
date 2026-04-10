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
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        //[HttpGet]
        //[Authorize(Policy = "AdminOnly")]
        //public async Task<ActionResult<PagedResult<AppointmentResponse>>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        //{
        //    var appointments = await _bookingService.GetAllWithDetailedAsync(pageNumber,pageSize);
        //    return Ok(appointments);
        //}
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] AppointmentFilter filter)
        {
            var appointments = await _bookingService.GetAppointmentsAsync(filter);
            return Ok(appointments);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AppointmentResponse>> GetById(int id)
        {
            var appointment = await _bookingService.GetByIdWithDetailsAsync(id);
            return Ok(appointment);
        }

        [HttpGet("me/schedule")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetMySchedule([FromQuery] DateOnly date)
        {
            var schedule = await _bookingService.GetMyScheduleAsync(date);
            return Ok(schedule);
        }

        [HttpGet("me")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult<PagedResult<AppointmentResponse>>> GetMyAppointments([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var appointments = await _bookingService.GetMyAppointmentsAsync(pageNumber,pageSize);
            return Ok(appointments);
        }

        [HttpPost("admin")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> CreateByAdmin([FromBody] CreateAppointmentRequest request)
        {
            var id = await _bookingService.CreateAppointmentByAdminAsync(request);
            var appointment = await _bookingService.GetByIdWithDetailsAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, appointment);
        }

        [HttpPost("me")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult> CreateByCustomer([FromBody] CreateAppointmentRequest request)
        {
            var id = await _bookingService.CreateAppointmentByCustomerAsync(request);
            var appointment = await _bookingService.GetByIdWithDetailsAsync(id);
            if(appointment == null)
                return NotFound();
            return CreatedAtAction(nameof(GetById), new { id }, appointment);
        }

        [HttpPut("admin/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateAppointmentRequest request)
        {
            await _bookingService.UpdateAppointmentAsync(id, request);
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] AppointmentStatus status)
        {
            await _bookingService.UpdateStatusAsync(id, status);
            return NoContent();
        }

        [HttpPatch("{id}/status/staff")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult> UpdateStatusByStaff(int id, [FromBody] AppointmentStatus status)
        {
            await _bookingService.UpdateStatusByStaffAsync(id, status);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Delete(int id)
        {
           await _bookingService.DeleteAppointmentAsync(id);
           return NoContent();
        }

        [HttpDelete("{appointmentId}/cancel")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<ActionResult> CancelByCustomer(int appointmentId)
        {
            await _bookingService.CancelAppointmentByCustomerAsync(appointmentId);
            return NoContent();
        }
    }
}