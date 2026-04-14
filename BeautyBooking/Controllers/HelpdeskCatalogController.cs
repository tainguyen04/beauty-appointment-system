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
    public class HelpdeskCatalogController : ControllerBase
    {
        private readonly ICatalogService _catalogService;
        private readonly IMapper _mapper;
        public HelpdeskCatalogController(ICatalogService catalogService, IMapper mapper)
        {
            _catalogService = catalogService;
            _mapper = mapper;
        }
        [HttpGet]
        [AllowAnonymous]
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
        [AllowAnonymous]
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
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> CreateAsync([FromBody] CreateCatalogRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest("Dữ liệu không hợp lệ!");
                var catalogId = await _catalogService.CreateAsync(request);
                var catalogResponse = _mapper.Map<HelpdeskCatalogResponse>(request);
                catalogResponse.CatalogId = catalogId;
                return CreatedAtAction(nameof(GetByIdAsync), new { id = catalogId }, catalogResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateCatalogRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest("Dữ liệu không hợp lệ!");
                var result = await _catalogService.UpdateAsync(id, request);
                if (!result)
                    return NotFound($"Không tìm thấy dữ liệu với id {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpPatch("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult> ActiveAsync(int id)
        {
            try
            {
                var result = await _catalogService.ActiveAsync(id);
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
        [Authorize(Policy = "AdminOnly")]
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
