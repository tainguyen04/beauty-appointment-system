using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class KnowledgeDocumentCofigs : IEntityTypeConfiguration<KnowledgeDocument>
    {
        public void Configure(EntityTypeBuilder<KnowledgeDocument> builder)
        {
            builder.HasKey(kd => kd.Id);

            builder
                .HasMany(kd => kd.Chunks)
                .WithOne(kc => kc.Document)
                .HasForeignKey(kc => kc.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
