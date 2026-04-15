using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class AppointmentConfigs : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.AppointmentDate)
                .IsRequired();

            builder.Property(a => a.StartTime)
                .IsRequired();

            builder.Property(a => a.EndTime)
                .IsRequired();
            builder.Property(a => a.WardId)
                .IsRequired();

            builder.Property(a => a.TotalPrice)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(a => a.AppointmentStatus)
                .HasConversion<int>()
                .IsRequired();

            builder.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Ward)
                .WithMany()
                .HasForeignKey(a => a.WardId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Staff)
                .WithMany(a => a.Appointments)
                .HasForeignKey(a => a.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(a => a.AppointmentServices)
                .WithOne(asv => asv.Appointment)
                .HasForeignKey(asv => asv.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasQueryFilter(a => !a.IsDeleted);
        }
    }
}
