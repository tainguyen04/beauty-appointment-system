using System.Text.Json;
using System.Text.Json.Serialization;

namespace BeautyBooking.AI.Models
{
    public class OllamaChatMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public string? Content { get; set; }

        [JsonPropertyName("tool_calls")]
        public List<OllamaChatMessageToolCall>? ToolCalls { get; set; }
    }

    public class OllamaChatMessageToolCall
    {
        [JsonPropertyName("function")]
        public OllamaFunction Function { get; set; } = new();
    }

    public class OllamaFunction
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("arguments")]
        public JsonElement Arguments { get; set; }
    }
}
