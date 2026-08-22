using BeautyBooking.DTO.Filter;
using BeautyBooking.Interface.Service;
using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace BeautyBooking.AI.Tools
{
    public sealed class SearchServicesPlugin
    {
        private readonly IServiceManager _serviceManager;

        public SearchServicesPlugin(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        [KernelFunction("search_services")]
        [Description("Tìm tối đa 5 dịch vụ làm đẹp đang hoạt động theo từ khóa và danh mục tùy chọn.")]
        public async Task<IReadOnlyList<SearchServiceResult>> SearchServicesAsync(
            [Description("Tên hoặc từ khóa dịch vụ. Có thể bỏ trống.")]
            string? keyword = null,

            [Description("ID danh mục dịch vụ. Có thể bỏ trống.")]
            int? categoryId = null
        )
        {
            var result = await _serviceManager.GetServicesAsync(new ServiceFilter
            {
                CategoryId = categoryId,
                Keyword = keyword,
                PageNumber = 1,
                PageSize = 20,
            });

            return result.Items
                .Where(service => service.IsActive)
                .Take(5)
                .Select(service => new SearchServiceResult
                {
                    Id = service.Id,
                    Name = service.Name,
                    Price = service.Price,
                    Duration = service.Duration,
                    CategoryName = service.CategoryName,
                    Description = service.Description,
                })
                .ToList();
        }
    }

    public class SearchServiceResult
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public string? CategoryName { get; set; }
        public string? Description { get; set; }
    }
}
