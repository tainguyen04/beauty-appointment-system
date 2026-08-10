using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class ConversationSummaryConfigs : IEntityTypeConfiguration<ConversationSummary>
    {
        public void Configure(EntityTypeBuilder<ConversationSummary> builder)
        {
            builder.HasKey(cs => cs.Id);
            builder
                .HasOne(cs => cs.Conversation)
                .WithMany()
                .HasForeignKey(cs => cs.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
