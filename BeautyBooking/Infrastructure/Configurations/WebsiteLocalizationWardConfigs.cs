using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class WebsiteLocalizationWardConfigs : IEntityTypeConfiguration<WebsiteLocalizationWard>
    {
        public void Configure(EntityTypeBuilder<WebsiteLocalizationWard> builder)
        {
            builder.HasKey(x => x.WardId);
            builder.Property(x => x.WardId)
                    .UseIdentityColumn();

            builder.Property(x => x.Name)
                    .IsRequired()
                    .HasMaxLength(64);
            builder.Property(x => x.NameEn)
                    .IsRequired()
                    .HasMaxLength(64);
            builder.Property(x => x.FullName)
                    .IsRequired()
                    .HasMaxLength(96);
            builder.Property(x => x.FullNameEn)
                    .IsRequired()
                    .HasMaxLength(96);
            builder.Property(x => x.Longitude)
                    .IsRequired();
            builder.Property(x => x.Latitude)
                    .IsRequired();
            builder.Property(x => x.KeyLocalization)
                    .IsRequired()
                    .HasMaxLength(32);
            builder.Property(x => x.IsActived)
                    .HasDefaultValue(true);

            builder.HasOne(x => x.WebsiteLocalization)
                    .WithMany(x => x.WebsiteLocalizationWards)
                    .HasForeignKey(x => x.KeyLocalization)
                    .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
