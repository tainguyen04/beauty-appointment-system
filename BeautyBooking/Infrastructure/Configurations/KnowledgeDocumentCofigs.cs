using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class KnowledgeDocumentCofigs : IEntityTypeConfiguration<KnowledgeDocument>
    {
        public void Configure(EntityTypeBuilder<KnowledgeDocument> builder)
        {
            builder.HasKey(kd => kd.Id);
            builder.Property(kd => kd.EmbeddingModel).HasMaxLength(100);
            builder.HasIndex(kd => new { kd.EmbeddingModel, kd.EmbeddingDimensions });

            builder
                .HasMany(kd => kd.Chunks)
                .WithOne(kc => kc.Document)
                .HasForeignKey(kc => kc.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}