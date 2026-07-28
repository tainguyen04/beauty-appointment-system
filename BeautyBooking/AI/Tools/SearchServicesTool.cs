using System.Text.Json;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.AI.Tools
{
    public class SearchServicesTool : ITool
    {
        public string Name => "search_services";
        public string Description =>
            "Tìm kiếm các dịch vụ làm đẹp trong BeautyBooking theo từ khóa và danh mục tùy chọn.";
        public object Parameters =>
            new
            {
                type = "object",
                properties = new
                {
                    keyword = new { type = "string", description = "Từ khóa tìm kiếm dịch vụ." },
                    categoryId = new
                    {
                        type = "integer",
                        description = "ID danh mục tùy chọn để lọc tìm kiếm.",
                    },
                },
                required = Array.Empty<string>(),
            };

        private readonly IServiceManager _serviceManager;

        public SearchServicesTool(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        public async Task<PagedResult<ServiceResponse>> SearchServicesAsync(
            string keyword,
            int? categoryId = null
        )
        {
            var filter = new ServiceFilter { CategoryId = categoryId, Keyword = keyword };
            return await _serviceManager.GetServicesAsync(filter);
        }

        public async Task<string> ExecuteAsync(
            JsonElement parameters,
            CancellationToken cancellationToken = default
        )
        {
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
            var filter = new ServiceFilter { CategoryId = categoryId, Keyword = keyword };
            var result = await _serviceManager.GetServicesAsync(filter);
            return JsonSerializer.Serialize(result);
        }
    }
}
