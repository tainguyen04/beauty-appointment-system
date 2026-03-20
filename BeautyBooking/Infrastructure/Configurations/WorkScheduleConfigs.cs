using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class WorkScheduleConfigs : IEntityTypeConfiguration<WorkSchedule>
    {
        public void Configure(EntityTypeBuilder<WorkSchedule> builder)
        {
            builder.HasKey(ws => ws.Id);

            builder.Property(ws => ws.DayOfWeek)
                .IsRequired();

            builder.Property(ws => ws.StartTime)
                .IsRequired();

            builder.Property(ws => ws.EndTime)
                .IsRequired();

            builder.HasOne(ws => ws.Staff)
                .WithMany()
                .HasForeignKey(ws => ws.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(ws => !ws.IsDeleted);
        }
    }
}
