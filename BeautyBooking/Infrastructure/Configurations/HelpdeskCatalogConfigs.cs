using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class HelpdeskCatalogConfigs : IEntityTypeConfiguration<HelpdeskCatalog>
    {
        public void Configure(EntityTypeBuilder<HelpdeskCatalog> builder)
        {
            builder.HasKey(x => x.CatalogId);
            builder.Property(x => x.CatalogId)
                    .UseIdentityColumn();

            builder.Property(x => x.KeyCatalog)
                    .IsRequired();
            builder.Property(x => x.NameVn)
                    .IsRequired()
                    .HasMaxLength(64);
            builder.Property(x => x.url)
                    .HasMaxLength(128)
                    .IsRequired(false);
            builder.Property(x => x.IsActived)
                   .HasDefaultValue(false);

            builder.HasQueryFilter(x => x.IsActived);

            builder.HasMany(x => x.HelpdeskContents)
                    .WithOne(x => x.HelpdeskCatalog)
                    .HasForeignKey(x => x.CatalogId)
                    .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
