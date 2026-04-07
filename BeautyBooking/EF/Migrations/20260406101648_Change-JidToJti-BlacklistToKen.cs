using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class ChangeJidToJtiBlacklistToKen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "jid",
                table: "blacklist_tokens",
                newName: "jti");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "jti",
                table: "blacklist_tokens",
                newName: "jid");
        }
    }
}
