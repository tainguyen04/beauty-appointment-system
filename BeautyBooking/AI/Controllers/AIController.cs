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
        private readonly IKnowledgeService _knowledgeService;

        public AIController(IAIService aiService, IKnowledgeService knowledgeService)
        {
            _aiService = aiService;
            _knowledgeService = knowledgeService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            var response = await _aiService.ChatAsync(request);
            return Ok(response);
        }

        [HttpPost("knowledge")]
        public async Task<IActionResult> CreateKnowledgeDocument(
            [FromBody] CreateKnowledgeDocumentRequest request
        )
        {
            var document = await _knowledgeService.CreateKnowledgeDocumentAsync(
                request.Title,
                request.Content
            );
            return Ok(document);
        }
    }
}
