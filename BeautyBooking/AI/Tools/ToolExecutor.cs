using System.Text.Json;
using BeautyBooking.AI.Interfaces;

namespace BeautyBooking.AI.Tools
{
    public class ToolExecutor
    {
        private readonly IToolRegistry _toolRegistry;

        public ToolExecutor(IToolRegistry toolRegistry)
        {
            _toolRegistry = toolRegistry;
        }

        public async Task<string> ExecuteAsync(
            string toolName,
            JsonElement parameters,
            CancellationToken cancellationToken = default
        )
        {
            var tool = _toolRegistry.Get(toolName);
            return await tool.ExecuteAsync(parameters, cancellationToken);
        }
    }
}
