namespace BeautyBooking.AI.Models
{
    public class RagContext
    {
        public IReadOnlyList<RagSource> Sources { get; init; } = [];
        public bool HasSources => Sources.Count > 0;
    }

    public class RagSource
    {
        public int DocumentId { get; init; }
        public int ChunkId { get; init; }
        public int ChunkIndex { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public double Distance { get; init; }
    }
}