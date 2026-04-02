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
    public class BeautyServiceController : ControllerBase
    {
        private readonly IServiceManager _serviceManager;

        public BeautyServiceController(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<PagedResult<ServiceResponse>>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _serviceManager.GetAllAsync(pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ServiceResponse>> GetById(int id)
        {
            var service = await _serviceManager.GetByIdAsync(id);
            if (service == null)
                return NotFound();
            return Ok(service);
        }

        [HttpGet("staff/{staffId}")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<ActionResult<IEnumerable<ServiceResponse>>> GetByStaffId(int staffId)
        {
            var services = await _serviceManager.GetByStaffIdAsync(staffId);
            return Ok(services);
        }

        [HttpGet("category/{categoryId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ServiceResponse>>> GetByCategoryId(int categoryId)
        {
            var services = await _serviceManager.GetByCategoryIdAsync(categoryId);
            return Ok(services);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<int>> Create([FromBody] CreateServiceRequest request)
        {
            var id = await _serviceManager.CreateAsync(request);
            var createdService = await _serviceManager.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, createdService);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceRequest request)
        {
            await _serviceManager.UpdateAsync(id, request);
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
        public async Task<ActionResult<decimal>> CalculateTotalAmount([FromBody] IEnumerable<int> serviceIds)
        {
            if(serviceIds == null || !serviceIds.Any())
                return BadRequest("Danh sách dịch vụ không được để trống.");

            var total = await _serviceManager.CalculateTotalAmountAsync(serviceIds);
            return Ok(new {TotalAmount = total});
        }
    }
}
