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
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        //[HttpGet]
        //[AllowAnonymous]
        //public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetAll()
        //{
        //    var categories = await _categoryService.GetAllAsync();
        //    return Ok(categories);
        //}
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] CategoryFilter filter)
        {
            var categories = await _categoryService.GetCategoriesAsync(filter);
            return Ok(categories);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CategoryResponse>> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound();
            return Ok(category);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<int>> Create(CategoryRequest request)
        {
            var id = await _categoryService.CreateAsync(request);
            var categoryResponse = await _categoryService.GetByIdAsync(id);

            return CreatedAtAction(nameof(GetById), new { id }, categoryResponse);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, CategoryRequest request)
        {
            var updated = await _categoryService.UpdateAsync(id, request);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            await _categoryService.DeleteAsync(id);
            return NoContent();
        }
    }
}
