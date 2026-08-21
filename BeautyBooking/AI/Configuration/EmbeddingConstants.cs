namespace BeautyBooking.AI.Configuration
{
    public static class EmbeddingConstants
    {
        // SQL Server requires the dimension in both the column and query type declarations.
        // Change this together with a migration that alters knowledge_chunks.embedding.
        public const int StorageDimensions = 768;
    }
}