using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class HelpdeskContentConfigs : IEntityTypeConfiguration<HelpdeskContent>
    {
        public void Configure(EntityTypeBuilder<HelpdeskContent> builder)
        {
            builder.HasKey(x => x.ContentId);
            builder.Property(x => x.ContentId)
                    .UseIdentityColumn();

            builder.Property(x => x.ContentDetail)
                    .IsRequired();
            builder.Property(x => x.CatalogId)
                    .IsRequired();

            builder.HasOne(x => x.HelpdeskCatalog)
                    .WithMany(x => x.HelpdeskContents)
                    .HasForeignKey(x => x.CatalogId)
                    .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
