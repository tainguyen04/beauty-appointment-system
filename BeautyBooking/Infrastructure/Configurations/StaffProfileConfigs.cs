using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class StaffProfileConfigs : IEntityTypeConfiguration<StaffProfile>
    {
        public void Configure(EntityTypeBuilder<StaffProfile> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.Bio)
                .IsRequired()
                .HasMaxLength(255);
            builder.Property(s => s.UserId)
                .IsRequired();
            builder.Property(s => s.WardId)
                .IsRequired();
            builder.HasQueryFilter(s => !s.IsDeleted);
            builder.HasOne(s => s.User)
                .WithOne(u => u.StaffProfile)
                .HasForeignKey<StaffProfile>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Ward)
                .WithMany()
                .HasForeignKey(s => s.WardId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(s => s.WorkSchedules)
                .WithOne(w => w.Staff)
                .HasForeignKey(w => w.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.Services)
                .WithMany(s => s.StaffProfiles);
            builder.HasMany(s => s.StaffDayOffs)
                .WithOne(d => d.Staff)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasMany(s => s.Appointments)
                .WithOne(a => a.Staff)
                .HasForeignKey(a => a.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
