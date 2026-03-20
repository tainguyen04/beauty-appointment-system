using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class CategoryConfigs : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(255);
            builder.HasQueryFilter(c => !c.IsDeleted);
            builder.HasMany(c => c.Services)
                .WithOne(s => s.Category)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
