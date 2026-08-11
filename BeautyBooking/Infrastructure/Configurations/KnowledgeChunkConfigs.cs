using System.Globalization;
using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class KnowledgeChunkConfigs : IEntityTypeConfiguration<KnowledgeChunk>
    {
        public void Configure(EntityTypeBuilder<KnowledgeChunk> builder)
        {
            builder.HasKey(kc => kc.Id);

            builder
                .Property(kc => kc.Embedding)
                .HasConversion(
                    // float[] -> string
                    v =>
                        "["
                        + string.Join(",", v.Select(x => x.ToString(CultureInfo.InvariantCulture)))
                        + "]",
                    // string -> float[]
                    v =>
                        v.Trim('[', ']')
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(x => float.Parse(x, CultureInfo.InvariantCulture))
                            .ToArray()
                )
                .HasColumnType("vector(768)");

            builder
                .HasOne(kc => kc.Document)
                .WithMany(kd => kd.Chunks)
                .HasForeignKey(kc => kc.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
