using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class WebsiteLocalizationConfigs : IEntityTypeConfiguration<WebsiteLocalization>
    {
        public void Configure(EntityTypeBuilder<WebsiteLocalization> builder)
        {
            builder.HasKey(x => x.KeyLocalization);

            builder.Property(x => x.KeyLocalization)
                    .HasMaxLength(32);
            builder.Property(x => x.Localization)
                    .IsRequired()
                    .HasMaxLength(32);
            builder.Property(x => x.IsActived)
                    .HasDefaultValue(true);

            builder.HasQueryFilter(x => x.IsActived);

            builder.HasMany(x => x.WebsiteLocalizationWards)
                    .WithOne(x => x.WebsiteLocalization)
                    .HasForeignKey(x => x.KeyLocalization)
                    .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
