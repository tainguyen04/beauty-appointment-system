using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.AI.Services
{
    public class KnowledgeService : IKnowledgeService
    {
        private const string SystemPrefix = "system:";
        private readonly IChunkService _chunkService;
        private readonly IEmBeddingService _embeddingService;
        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _environment;

        public KnowledgeService(IChunkService chunkService, IEmBeddingService embeddingService,
            ApplicationDbContext dbContext, IWebHostEnvironment environment)
        {
            _chunkService = chunkService;
            _embeddingService = embeddingService;
            _dbContext = dbContext;
            _environment = environment;
        }

        public async Task<KnowledgeDocumentResponse> CreateKnowledgeDocumentAsync(
            string title, string content, CancellationToken cancellationToken = default)
        {
            ValidateDocument(title, content);
            var document = new KnowledgeDocument { Title = title.Trim(), Content = content.Trim() };
            document.Chunks = await CreateChunksAsync(document.Content, cancellationToken);
            _dbContext.KnowledgeDocuments.Add(document);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return Map(document);
        }

        public async Task UpdateKnowledgeDocumentAsync(int documentId, string title, string content,
            CancellationToken cancellationToken = default)
        {
            ValidateDocument(title, content);
            var document = await _dbContext.KnowledgeDocuments.Include(d => d.Chunks)
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken)
                ?? throw new KeyNotFoundException("Không tìm thấy tài liệu kiến thức.");
            _dbContext.KnowledgeChunks.RemoveRange(document.Chunks);
            document.Title = title.Trim();
            document.Content = content.Trim();
            document.Chunks = await CreateChunksAsync(document.Content, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteKnowledgeDocumentAsync(int documentId,
            CancellationToken cancellationToken = default)
        {
            var document = await _dbContext.KnowledgeDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken)
                ?? throw new KeyNotFoundException("Không tìm thấy tài liệu kiến thức.");
            _dbContext.KnowledgeDocuments.Remove(document);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<int> ReindexSystemKnowledgeAsync(CancellationToken cancellationToken = default)
        {
            var oldDocuments = await _dbContext.KnowledgeDocuments
                .Where(d => d.Title.StartsWith(SystemPrefix)).ToListAsync(cancellationToken);
            _dbContext.KnowledgeDocuments.RemoveRange(oldDocuments);
            var sources = new List<(string Title, string Content)>();

            var directory = Path.Combine(_environment.ContentRootPath, "AI", "Knowledge");
            if (Directory.Exists(directory))
            {
                foreach (var path in Directory.EnumerateFiles(directory, "*.md"))
                    sources.Add(($"{SystemPrefix}policy:{Path.GetFileNameWithoutExtension(path)}",
                        await File.ReadAllTextAsync(path, cancellationToken)));
            }

            var services = await _dbContext.Services.AsNoTracking()
                .Where(s => s.IsActive && !s.IsDeleted)
                .Select(s => new { s.Id, s.Name, s.Description, s.Price, s.Duration })
                .ToListAsync(cancellationToken);
            sources.AddRange(services.Select(s => (
                $"{SystemPrefix}service:{s.Id}",
                $"Dịch vụ: {s.Name}\nMô tả: {s.Description ?? "Chưa có"}\nGiá: {s.Price}\nThời lượng: {s.Duration} phút")));

            var helpdesk = await _dbContext.HelpdeskCatalogs.AsNoTracking()
                .Where(c => c.IsActived)
                .SelectMany(c => c.HelpdeskContents.Select(h =>
                    new { c.CatalogId, c.NameVn, h.ContentId, h.ContentDetail }))
                .ToListAsync(cancellationToken);
            sources.AddRange(helpdesk.Select(h => (
                $"{SystemPrefix}helpdesk:{h.CatalogId}:{h.ContentId}",
                $"Chủ đề: {h.NameVn}\n{h.ContentDetail}")));

            foreach (var source in sources.Where(s => !string.IsNullOrWhiteSpace(s.Content)))
            {
                var document = new KnowledgeDocument { Title = source.Title, Content = source.Content };
                document.Chunks = await CreateChunksAsync(source.Content, cancellationToken);
                _dbContext.KnowledgeDocuments.Add(document);
            }
            await _dbContext.SaveChangesAsync(cancellationToken);
            return sources.Count;
        }

        private async Task<List<KnowledgeChunk>> CreateChunksAsync(string content,
            CancellationToken cancellationToken)
        {
            var chunks = _chunkService.SplitTextIntoChunks(content);
            var result = new List<KnowledgeChunk>(chunks.Count);
            for (var index = 0; index < chunks.Count; index++)
                result.Add(new KnowledgeChunk
                {
                    Content = chunks[index],
                    ChunkIndex = index,
                    Embedding = await _embeddingService.GenerateEmbeddingAsync(chunks[index], cancellationToken)
                });
            return result;
        }

        private static void ValidateDocument(string title, string content)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Tiêu đề tài liệu không được để trống.");
            if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Nội dung tài liệu không được để trống.");
        }

        private static KnowledgeDocumentResponse Map(KnowledgeDocument document) => new()
        {
            Id = document.Id,
            Title = document.Title,
            Content = document.Content,
            Chunks = document.Chunks.Select(c => new KnowledgeChunkResponse
            { Id = c.Id, Content = c.Content, ChunkIndex = c.ChunkIndex }).ToList(),
        };
    }
}