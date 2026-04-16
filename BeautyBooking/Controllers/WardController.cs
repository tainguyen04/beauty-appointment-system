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
    public class WardController : ControllerBase
    {
        private readonly IWardSerivce _wardService;

        public WardController(IWardSerivce wardService)
        {
            _wardService = wardService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WardResponse>>> GetAll()
        {
            var result = await _wardService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WardResponse>> GetById(int id)
        {
            var ward = await _wardService.GetByIdAsync(id);
            if (ward == null)
                return NotFound();
            return Ok(ward);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Create([FromBody] CreateWardRequest request)
        {
            var created = await _wardService.CreateAsync(request);
            if (!created)
                return BadRequest();
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateWardRequest request)
        {
            var updated = await _wardService.UpdateAsync(id, request);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _wardService.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
