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
        public async Task<ActionResult<AppointmentResponse>> GetById(int id)
        {
            var appointment = await _appointmentService.GetByIdWithDetailsAsync(id);
            return Ok(appointment);
        }


        [HttpPost]
        [Authorize(Policy = "CustomerOrAdmin")]
        public async Task<ActionResult> Create([FromBody] CreateAppointmentRequest request)
        {
            var id = await _appointmentService.CreateAsync(request);
            var appointment = await _appointmentService.GetByIdWithDetailsAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, appointment);
        }

        [HttpPut("admin/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateAppointmentRequest request)
        {
            await _appointmentService.UpdateAsync(id, request);
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] AppointmentStatus status)
        {
            await _appointmentService.UpdateStatusAsync(id, status);
            return NoContent();
        }


        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Delete(int id)
        {
           await _appointmentService.DeleteAsync(id);
           return NoContent();
        }
    }
}