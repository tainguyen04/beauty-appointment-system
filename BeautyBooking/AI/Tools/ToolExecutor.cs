using System.Text.Json;

namespace BeautyBooking.AI.Tools
{
    public class ToolExecutor
    {
        private readonly SearchServicesTool _searchServicesTool;
        private readonly JsonSerializerOptions _jsonSerializerOptions;

        public ToolExecutor(
            SearchServicesTool searchServicesTool,
            JsonSerializerOptions jsonSerializerOptions
        )
        {
            _searchServicesTool = searchServicesTool;
            _jsonSerializerOptions = jsonSerializerOptions;
        }

        public async Task<string> ExecuteAsync(
            string toolName,
            JsonElement parameters,
            CancellationToken cancellationToken = default
        )
        {
            switch (toolName)
            {
                case "search_services":
                    string? keyword = null;
                    int? categoryId = null;
                    if (parameters.TryGetProperty("keyword", out var keywordElement))
                    {
                        keyword = keywordElement.GetString();
                    }
                    if (
                        parameters.TryGetProperty("categoryId", out var categoryIdElement)
                        && categoryIdElement.ValueKind == JsonValueKind.Number
                    )
                    {
                        categoryId = categoryIdElement.GetInt32();
                    }
                    var result = await _searchServicesTool.SearchServicesAsync(keyword, categoryId);
                    return JsonSerializer.Serialize(result, _jsonSerializerOptions);
                default:
                    throw new NotSupportedException($"Tool '{toolName}' is not supported.");
            }
        }
    }
}
