using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class addPublicIdintoUserAndService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "avatar_public_id",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "image_public_id",
                table: "services",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "avatar_public_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "image_public_id",
                table: "services");
        }
    }
}
