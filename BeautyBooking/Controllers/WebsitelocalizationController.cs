using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WebsitelocalizationController : ControllerBase
    {
        private readonly ILocalizationService _localizationService;
        public WebsitelocalizationController(ILocalizationService localizationService)
        {
            _localizationService = localizationService;
        }
        [HttpGet]
        public async Task<ActionResult<List<LocalizationResponse>>> GetAllAsync()
        {
            try
            {
                var localizations = await _localizationService.GetAllAsync();
                if (localizations == null || !localizations.Any())
                    return NotFound("Không tìm thấy dữ liệu.");
                return Ok(localizations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpGet("{key}")]
        public async Task<ActionResult<LocalizationResponse>> GetByIdAsync(string key)
        {
            try
            {
                var localization = await _localizationService.GetByIdAsync(key);
                if (localization == null)
                    return NotFound($"Không tìm thấy dữ liệu với id {key}");
                return Ok(localization);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpPost]
        public async Task<ActionResult<string>> CreateAsync([FromBody] CreateLocalizationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest("Dữ liệu không hợp lệ!");
                var result = await _localizationService.CreateAsync(request);
                return CreatedAtAction(nameof(GetByIdAsync), new {id = result }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpPut("{key}")]
        public async Task<ActionResult> Update(string key, [FromBody] UpdateLocalizationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest("Dữ liệu không hợp lệ!");
                var isUpdated = await _localizationService.Update(key, request);
                if (!isUpdated)
                    return NotFound($"Không tìm thấy dữ liệu với id {key}");
                return Ok("Cập nhật thành công!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
        [HttpDelete("{key}")]
        public async Task<ActionResult> DeleteAsync(string key)
        {
            try
            {
                var isDeleted = await _localizationService.DeleteAsync(key);
                if (!isDeleted)
                    return NotFound($"Không tìm thấy dữ liệu với id {key}");
                return Ok("Xóa thành công!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
    }
}
