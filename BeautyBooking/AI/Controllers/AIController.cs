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
        private readonly IPythonAIService _pythonAIService;

        public AIController(
            IAIService aiService,
            IKnowledgeService knowledgeService,
            IPythonAIService pythonAIService
        )
        {
            _aiService = aiService;
            _knowledgeService = knowledgeService;
            _pythonAIService = pythonAIService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            var response = await _aiService.ChatAsync(request);
            return Ok(response);
        }

        [HttpPost("knowledge")]
        public async Task<IActionResult> CreateKnowledge(
            [FromBody] CreateKnowledgeDocumentRequest request
        )
        {
            var response = await _knowledgeService.CreateKnowledgeDocumentAsync(
                request.Title,
                request.Content
            );
            return Ok(response);
        }

        [HttpGet("python-health")]
        public async Task<IActionResult> PythonHealth()
        {
            var isHealthy = await _pythonAIService.HealthCheckAsync();
            return Ok(new { IsHealthy = isHealthy });
        }

        [HttpPost("python-ingest")]
        public async Task<IActionResult> PythonIngest([FromBody] PythonKnowledgeRequest request)
        {
            await _pythonAIService.IngestKnowledgeAsync(request);
            return Ok();
        }

        [HttpPost("test-python-ask")]
        public async Task<IActionResult> TestPythonAsk([FromBody] string question)
        {
            var response = await _pythonAIService.AskAsync(question);
            return Ok(new { Answer = response });
        }
    }
}
