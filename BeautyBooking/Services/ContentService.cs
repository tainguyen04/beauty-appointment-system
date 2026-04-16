using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class ContentService : IContentService
    {
        private readonly IRepository<HelpdeskContent, int> _contentRepository;
        private readonly IMapper _mapper;
        public ContentService(IRepository<HelpdeskContent, int> contentRepository, IMapper mapper)
        {
            _contentRepository = contentRepository;
            _mapper = mapper;
        }
        public async Task<bool> CreateAsync(int catalogId, CreateContentRequest request)
        {
            var content = _mapper.Map<HelpdeskContent>(request);
            content.CatalogId = catalogId;
            await _contentRepository.CreateAsync(content);
            return true;
        }

        public async Task<bool> DeleteAsync(int contentId)
        {
            var content = await _contentRepository.GetByIdAsync(contentId);
            if (content == null)
                return false;
            _contentRepository.Delete(content);
            return true;
        }

        public async Task<IEnumerable<HelpdeskContentResponse>> GetAllAsync()
        {
            return _mapper.Map<IEnumerable<HelpdeskContentResponse>>(await _contentRepository.GetAllAsync());
        }

        public async Task<HelpdeskContentResponse?> GetByIdAsync(int contentId)
        {
            var content = await _contentRepository.GetByIdAsync(contentId);
            if (content == null)
                return null;
            return _mapper.Map<HelpdeskContentResponse>(content);
        }

        public async Task<bool> UpdateAsync(int contentId, UpdateContentRequest request)
        {
            var content = await _contentRepository.GetByIdAsync(contentId);
            if (content == null)
                return false;
            _mapper.Map(request, content);
            await _contentRepository.SaveChangesAsync();
            return true;
        }
    }
}
