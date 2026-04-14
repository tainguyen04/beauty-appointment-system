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
    public class WebsitelocalizationController : ControllerBase
    {
        private readonly ILocalizationService _localizationService;
        public WebsitelocalizationController(ILocalizationService localizationService)
        {
            _localizationService = localizationService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<LocalizationResponse>>> GetAll()
        {
            var result = await _localizationService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<LocalizationResponse>> GetById(string id)
        {
            var localization = await _localizationService.GetByIdAsync(id);
            if (localization == null)
                return NotFound();
            return Ok(localization);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<string>> Create([FromBody] CreateLocalizationRequest request)
        {
            var key = await _localizationService.CreateAsync(request);
            var created = await _localizationService.GetByIdAsync(key);
            return CreatedAtAction(nameof(GetById), new { id = key }, created);
        }
        [HttpPost("{key}/wards")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AddWard(string key, [FromBody] IEnumerable<CreateWardRequest> request)
        {
            var added = await _localizationService.AddWardAsync(key, request);
            if (!added)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{key}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(string key, [FromBody] UpdateLocalizationRequest request)
        {
            var updated = await _localizationService.UpdateAsync(key, request);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{key}/wards")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateWard(string key, [FromBody] IEnumerable<UpdateWardRequest> request)
        {
            var updated = await _localizationService.UpdateWardAsync(key, request);
            if (!updated)
                return NotFound();
            return NoContent();
        }
        [HttpPatch("{key}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Active(string key)
        {
            var activated = await _localizationService.ActiveAsync(key);
            if (!activated)
                return NotFound();
            return NoContent();
        }
        [HttpPatch("{key}/wards")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ActiveWard(string key, [FromBody] IEnumerable<int> wardIds)
        {
            var activated = await _localizationService.ActiveWardAsync(key, wardIds);
            if (!activated)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _localizationService.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
        [HttpDelete("{key}/wards")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteWard(string key, [FromBody] IEnumerable<int> wardIds)
        {
            var deleted = await _localizationService.DeleteWardAsync(key, wardIds);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
