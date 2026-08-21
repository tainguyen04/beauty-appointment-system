using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class MessageConfigs : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.HasKey(m => m.Id);
            builder.Property(m => m.Content).IsRequired();
            builder.Property(m => m.Role).IsRequired().HasMaxLength(20);
            builder.Property(m => m.Role).HasConversion<string>();
            builder.HasIndex(m => new { m.ConversationId, m.CreatedAt });
            builder.HasQueryFilter(m => !m.IsDeleted && !m.Conversation.IsDeleted);
            builder
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}