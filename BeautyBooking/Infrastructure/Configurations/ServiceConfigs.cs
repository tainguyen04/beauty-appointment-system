using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class ServiceConfigs : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(255);
            builder.Property(s => s.Price)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
            builder.Property(s => s.Duration)
                .IsRequired();
            builder.HasQueryFilter(s => !s.IsDeleted);
            builder.HasOne(s => s.Category)
                .WithMany(c => c.Services)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(s => s.StaffProfiles)
                .WithMany(sp => sp.Services);

        }
    }
}
