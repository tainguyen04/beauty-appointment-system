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
    public class BeautyServiceController : ControllerBase
    {
        private readonly IServiceManager _serviceManager;
        private readonly IMapper _mapper;

        public BeautyServiceController(IServiceManager serviceManager, IMapper mapper)
        {
            _serviceManager = serviceManager;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<ServiceResponse>>> GetAll()
        {
            var services = await _serviceManager.GetAllAsync();
            if (services == null || !services.Any())
                return NoContent();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse>> GetById(int id)
        {
            var service = await _serviceManager.GetByIdAsync(id);
            if (service == null)
                return NotFound();
            return Ok(service);
        }

        [HttpPost]
        public async Task<ActionResult<ServiceResponse>> Create([FromBody] CreateServiceRequest request)
        {
            if(!ModelState.IsValid)
                return BadRequest("Dữ liệu không hợp lệ!");

            var serviceId = await _serviceManager.CreateAsync(request);
            var serviceEntity = await _serviceManager.GetByIdAsync(serviceId);
            if (serviceEntity == null)
                return NotFound();

            var serviceResponse = _mapper.Map<ServiceResponse>(serviceEntity);

            return CreatedAtAction(nameof(GetById), new { id = serviceId }, serviceResponse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceRequest request)
        {
            var result = await _serviceManager.Update(id, request);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _serviceManager.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<List<ServiceResponse>>> GetByCategoryId(int categoryId)
        {
            var services = await _serviceManager.GetByCategoryIdAsync(categoryId);
            if (services == null || !services.Any())
                return NoContent();
            return Ok(services);
        }
    }
}
