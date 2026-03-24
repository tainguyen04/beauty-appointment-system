using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class updatebase_entityaddIsActived : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "work_schedules",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "staff_profiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "staff_day_offs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "services",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "appointments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_actived",
                table: "appointment_services",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "work_schedules");

            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "users");

            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "staff_profiles");

            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "staff_day_offs");

            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "services");

            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "categories");

            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "is_actived",
                table: "appointment_services");
        }
    }
}
