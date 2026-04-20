using AutoMapper;
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
    public class BeautyServiceController : ControllerBase
    {
        private readonly IServiceManager _serviceManager;

        public BeautyServiceController(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] ServiceFilter filter)
        {
            var result = await _serviceManager.GetServicesAsync(filter);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceResponse>> GetById(int id)
        {
            var service = await _serviceManager.GetByIdAsync(id);
            if (service == null)
                return NotFound();
            return Ok(service);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<int>> Create([FromForm] CreateServiceRequest request)
        {
            var id = await _serviceManager.CreateAsync(request);
            var createdService = await _serviceManager.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, createdService);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateServiceRequest request)
        {
            var result = await _serviceManager.UpdateAsync(id, request);
            if(!result)
                return BadRequest("Không thể cập nhật dịch vụ. Vui lòng kiểm tra lại.");
            return NoContent();
        }
        [HttpPatch("{id}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool isActive)
        {
            var result = await _serviceManager.UpdateStatusAsync(id, isActive);
            if (!result)
                return BadRequest("Không thể cập nhật trạng thái dịch vụ. Vui lòng kiểm tra lại.");
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            await _serviceManager.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("calculate-total")]
        [Authorize]
        public async Task<ActionResult<decimal>> CalculateTotalPrice([FromBody] IEnumerable<int> serviceIds)
        {
            if(serviceIds == null || !serviceIds.Any())
                return BadRequest("Danh sách dịch vụ không được để trống.");

            var total = await _serviceManager.CalculateTotalPriceAsync(serviceIds);
            return Ok(new {TotalAmount = total});
        }
    }
}
