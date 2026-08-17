using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class ConversationSummaryConfigs : IEntityTypeConfiguration<ConversationSummary>
    {
        public void Configure(EntityTypeBuilder<ConversationSummary> builder)
        {
            builder.HasKey(cs => cs.Id);
            builder.HasQueryFilter(cs => !cs.IsDeleted && !cs.Conversation.IsDeleted);
            builder
                .HasOne(cs => cs.Conversation)
                .WithMany()
                .HasForeignKey(cs => cs.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}