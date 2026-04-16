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
    public class HelpdeskContentController : ControllerBase
    {
        private readonly IContentService _contentService;

        public HelpdeskContentController(IContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<HelpdeskContentResponse>>> GetAll()
        {
            var result = await _contentService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<HelpdeskContentResponse>> GetById(int id)
        {
            var content = await _contentService.GetByIdAsync(id);
            if (content == null)
                return NotFound();
            return Ok(content);
        }

        [HttpPost("{catalogId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create(int catalogId, [FromBody] CreateContentRequest request)
        {
            var created = await _contentService.CreateAsync(catalogId, request);
            if (!created)
                return BadRequest();
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateContentRequest request)
        {
            var updated = await _contentService.UpdateAsync(id, request);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _contentService.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
