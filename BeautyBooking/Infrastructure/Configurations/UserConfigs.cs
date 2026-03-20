using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class UserConfigs : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            builder.Property(u => u.FullName)
                .IsRequired()
                .HasMaxLength(255);
            builder.HasIndex(u => u.Email)
                .IsUnique();
            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(150);
            builder.Property(u => u.Phone)
                .IsRequired()
                .HasMaxLength(20);
            builder.HasQueryFilter(u => !u.IsDeleted);

            builder.HasOne(u => u.StaffProfile)
                .WithOne(s => s.User)
                .HasForeignKey<StaffProfile>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(u => u.Ward)
               .WithMany()
               .HasForeignKey(u => u.WardId)
               .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
