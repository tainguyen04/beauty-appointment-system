using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class StaffDayOffConfigs : IEntityTypeConfiguration<StaffDayOff>
    {
        public void Configure(EntityTypeBuilder<StaffDayOff> builder)
        {
            builder.HasKey(d => d.Id);
            builder.Property(d => d.Reason)
                .IsRequired()
                .HasMaxLength(255);
            builder.HasQueryFilter(d => !d.IsDeleted);
            builder.HasOne(d => d.Staff)
                .WithMany(s => s.StaffDayOffs)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
