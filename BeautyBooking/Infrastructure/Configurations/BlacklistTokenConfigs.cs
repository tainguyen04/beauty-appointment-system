using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BeautyBooking.Infrastructure.Configurations
{
    public class BlacklistTokenConfigs : IEntityTypeConfiguration<BlacklistToken>
    {
        public void Configure(EntityTypeBuilder<BlacklistToken> builder)
        {
            builder.HasKey(bl => bl.Id);
        }
    }
}
