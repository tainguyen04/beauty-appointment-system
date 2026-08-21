using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using Microsoft.AspNetCore.Authorization;
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
        private readonly ILogger<AIController> _logger;

        public AIController(
            IAIService aiService,
            IKnowledgeService knowledgeService,
            ILogger<AIController> logger
        )
        {
            _aiService = aiService;
            _knowledgeService = knowledgeService;
            _logger = logger;
        }

        [HttpPost("chat")]
        [AllowAnonymous]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            try
            {
                var response = await _aiService.ChatAsync(request, HttpContext.RequestAborted);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.StartsWith("Gemini"))
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { Message = ex.Message });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Gemini request failed.");
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    new { Message = "Không thể kết nối dịch vụ AI. Vui lòng thử lại sau." }
                );
            }
        }

        [HttpGet("conversations")]
        [Authorize]
        public async Task<IActionResult> GetConversations()
        {
            var response = await _aiService.GetConversationsAsync(HttpContext.RequestAborted);
            return Ok(response);
        }

        [HttpGet("conversations/{conversationId:int}/messages")]
        [Authorize]
        public async Task<IActionResult> GetMessages(int conversationId)
        {
            try
            {
                var response = await _aiService.GetMessagesAsync(
                    conversationId,
                    HttpContext.RequestAborted
                );
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPost("knowledge")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateKnowledge(
            [FromBody] CreateKnowledgeDocumentRequest request
        )
        {
            var response = await _knowledgeService.CreateKnowledgeDocumentAsync(
                request.Title,
                request.Content,
                HttpContext.RequestAborted
            );
            return Ok(response);
        }

        [HttpPost("knowledge/reindex")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ReindexKnowledge()
        {
            var count = await _knowledgeService.ReindexSystemKnowledgeAsync(
                HttpContext.RequestAborted
            );
            return Ok(new { DocumentsIndexed = count });
        }

    }
}
