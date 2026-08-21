using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Globalization;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class KnowledgeChunkConfigs : IEntityTypeConfiguration<KnowledgeChunk>
    {
        public void Configure(EntityTypeBuilder<KnowledgeChunk> builder)
        {
            builder.HasKey(kc => kc.Id);

            var embeddingProperty = builder
                .Property(kc => kc.Embedding)
                .HasConversion(
                    // float[] -> string
                    v =>
                        "["
                        + string.Join(",", (v ?? Array.Empty<float>()).Select(x => x.ToString(CultureInfo.InvariantCulture)))
                        + "]",
                    // string -> float[]
                    v =>
                        v.Trim('[', ']')
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(x => float.Parse(x, CultureInfo.InvariantCulture))
                            .ToArray()
                )
                .HasColumnType($"vector({AI.Configuration.EmbeddingConstants.StorageDimensions})");

            // EF Core cannot detect in-place changes inside arrays without a value comparer.
            embeddingProperty.Metadata.SetValueComparer(
                new ValueComparer<float[]?>(
                    (left, right) => left == right || (left != null && right != null && left.SequenceEqual(right)),
                    value => value == null ? 0 : value.Aggregate(0, (hash, item) => HashCode.Combine(hash, item)),
                    value => value == null ? null : value.ToArray()));

            builder
                .HasOne(kc => kc.Document)
                .WithMany(kd => kd.Chunks)
                .HasForeignKey(kc => kc.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}