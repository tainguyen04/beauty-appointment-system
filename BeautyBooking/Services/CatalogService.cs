using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;

namespace BeautyBooking.Services
{
    public class CatalogService : ICatalogService
    {
        private readonly ICatalogRepository _catalogRepo;
        private readonly IRepository<HelpdeskContent, int> _contentRepo;
        private readonly IMapper _mapper;
        public CatalogService(ICatalogRepository catalogRepo, IRepository<HelpdeskContent, int> contentRepo, IMapper mapper)
        {
            _catalogRepo = catalogRepo;
            _contentRepo = contentRepo;
            _mapper = mapper;
        }
        public async Task<int> CreateAsync(CreateCatalogRequest request)
        {
            var catalog = _mapper.Map<HelpdeskCatalog>(request);
            await _catalogRepo.CreateAsync(catalog);
            await _catalogRepo.SaveChangesAsync();

            return catalog.CatalogId;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var catalog = await _catalogRepo.GetByIdAsync(id);
            if (catalog == null)
                return false;
            catalog.IsActived = false;
            await _catalogRepo.SaveChangesAsync();
            return true;
        }

        public async Task<List<HelpdeskCatalogResponse>> GetAllAsync()
        {
            var catalog = await _catalogRepo.GetAllWithContentsAsync();
            return _mapper.Map<List<HelpdeskCatalogResponse>>(catalog);
        }

        public async Task<HelpdeskCatalogResponse?> GetByIdAsync(int id)
        {
            var catalog = await _catalogRepo.GetWithContentsAsync(id);
            return catalog == null ? null : _mapper.Map<HelpdeskCatalogResponse?>(catalog);
        }

        public async Task<bool> Update(int id, UpdateCatalogRequest request)
        {
            var existingCatalog = await _catalogRepo.GetByIdAsync(id);
            if (existingCatalog == null)
                return false;
            _mapper.Map(request, existingCatalog);
            if(request.Contents != null)
            {
                foreach(var oldContent in existingCatalog.HelpdeskContents.ToList())
                {
                    _contentRepo.Delete(oldContent);
                }
                existingCatalog.HelpdeskContents = request.Contents.Select(text => new HelpdeskContent 
                { 
                    ContentDetail = text,
                    CatalogId = id
                }).ToList();
            }
            await _catalogRepo.SaveChangesAsync();
            return true;
        }
    }
}
