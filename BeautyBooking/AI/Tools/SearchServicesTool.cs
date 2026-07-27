using BeautyBooking.DTO.Filter;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.AI.Tools
{
    public class SearchServicesTool
    {
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
    }
}
