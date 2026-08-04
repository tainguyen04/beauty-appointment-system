using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using BeautyBooking.AI.Prompt;
using BeautyBooking.AI.Providers;
using BeautyBooking.Interface.Service;
using Microsoft.Extensions.Options;

namespace BeautyBooking.AI.Services
{
    public class AIService : IAIService
    {
        private readonly IConversationService _conversationService;
        private readonly IAIProviderFactory _aiProviderFactory;
        private readonly AIOptions _aiOptions;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPromptTemplate _promptTemplate;
        private readonly IContextWindowService _contextWindowService;

        public AIService(
            IAIProviderFactory aiProviderFactory,
            IOptions<AIOptions> aiOptions,
            IConversationService conversationService,
            ICurrentUserService currentUserService,
            IPromptTemplate promptTemplate,
            IContextWindowService contextWindowService
        )
        {
            _aiProviderFactory = aiProviderFactory;
            _aiOptions = aiOptions.Value;
            _conversationService = conversationService;
            _currentUserService = currentUserService;
            _promptTemplate = promptTemplate;
            _contextWindowService = contextWindowService;
        }

        public async Task<ChatResponse> ChatAsync(
            ChatRequest request,
            CancellationToken cancellationToken = default
        )
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
                throw new ArgumentException("Prompt cannot be empty.");
            int conversationId;
            if (request.ConversationId is null or 0)
            {
                var conversation = await _conversationService.CreateAsync(cancellationToken);
                conversationId = conversation.Id;
            }
            else
            {
                var conversation =
                    await _conversationService.GetByIdAsync(
                        request.ConversationId.Value,
                        cancellationToken
                    )
                    ?? throw new ArgumentException(
                        $"Conversation with ID {request.ConversationId} not found."
                    );
                conversationId = conversation.Id;
            }
            await _conversationService.AddMessageAsync(
                conversationId,
                request.Prompt,
                ChatRole.User,
                cancellationToken
            );

            var context = new PromptContext
            {
                UserRole = _currentUserService.Role,
                ConversationSummary = null,
                KnowledgeBase = [],
            };
            var systemPrompt = _promptTemplate.Build(context);
            var messages = await _contextWindowService.BuildContextWindowAsync(
                conversationId,
                systemPrompt,
                cancellationToken
            );
            var provider = _aiProviderFactory.GetProvider(_aiOptions.Provider);
            var response = await provider.GenerateResponseAsync(messages, cancellationToken);

            await _conversationService.AddMessageAsync(
                conversationId,
                response,
                ChatRole.Assistant,
                cancellationToken
            );
            return new ChatResponse { ConversationId = conversationId, Message = response };
        }
    }
}
