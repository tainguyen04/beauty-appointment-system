using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HelpdeskCatalogController : ControllerBase
    {
        private readonly ICatalogService _catalogService;
        public HelpdeskCatalogController(ICatalogService catalogService)
        {
            _catalogService = catalogService;
        }
        [HttpGet]
        public async Task<ActionResult<List<HelpdeskCatalogResponse>>> GetAllAsync()
        {
            try
            {
                var catalogs = await _catalogService.GetAllAsync();
                if (catalogs == null || !catalogs.Any())
                    return NotFound("Không tìm thấy dữ liệu.");
                return Ok(catalogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<HelpdeskCatalogResponse>> GetByIdAsync(int id)
        {
            try
            {
                var catalog = await _catalogService.GetByIdAsync(id);
                if (catalog == null)
                    return NotFound($"Không tìm thấy dữ liệu với id {id}");
                return Ok(catalog);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpPost]
        public async Task<ActionResult<string>> CreateAsync([FromBody] CreateCatalogRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest("Dữ liệu không hợp lệ!");
                var result = await _catalogService.CreateAsync(request);
                return CreatedAtAction(nameof(GetByIdAsync),new { id = result }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateCatalogRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest("Dữ liệu không hợp lệ!");
                var result = await _catalogService.Update(id, request);
                if (!result)
                    return NotFound($"Không tìm thấy dữ liệu với id {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(int id)
        {
            try
            {
                var result = await _catalogService.DeleteAsync(id);
                if (!result)
                    return NotFound($"Không tìm thấy dữ liệu v���i id {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }

        }
    }
}
