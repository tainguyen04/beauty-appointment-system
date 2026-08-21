using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Providers;

namespace BeautyBooking.AI.Factories
{
    public class AIProviderFactory : IAIProviderFactory
    {
        private readonly OllamaProvider _ollamaProvider;
        private readonly OpenAIProvider _openAIProvider;

        public AIProviderFactory(OllamaProvider ollamaProvider, OpenAIProvider openAIProvider)
        {
            _ollamaProvider = ollamaProvider;
            _openAIProvider = openAIProvider;
        }

        public IAIProvider GetProvider(AIProviderType providerType)
        {
            return providerType switch
            {
                AIProviderType.Ollama => _ollamaProvider,
                AIProviderType.OpenAI => _openAIProvider,
                _ => throw new ArgumentException($"No provider found for type {providerType}"),
            };
        }
    }
}
