using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.AI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        public AIController(IAIService aiService)
        {
            _aiService = aiService;
        }
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            var response = await _aiService.ChatAsync(request);
            return Ok(response);
        }
    }
}
