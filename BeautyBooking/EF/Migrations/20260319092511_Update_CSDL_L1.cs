using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class Update_CSDL_L1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_helpdesk_contents_helpdesk_catalogs_catalog_id",
                table: "helpdesk_contents");

            migrationBuilder.DropForeignKey(
                name: "fk_website_localization_wards_website_localizations_key_localization",
                table: "website_localization_wards");

            migrationBuilder.AddForeignKey(
                name: "fk_helpdesk_contents_helpdesk_catalogs_catalog_id",
                table: "helpdesk_contents",
                column: "catalog_id",
                principalTable: "helpdesk_catalogs",
                principalColumn: "catalog_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_website_localization_wards_website_localizations_key_localization",
                table: "website_localization_wards",
                column: "key_localization",
                principalTable: "website_localizations",
                principalColumn: "key_localization",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_helpdesk_contents_helpdesk_catalogs_catalog_id",
                table: "helpdesk_contents");

            migrationBuilder.DropForeignKey(
                name: "fk_website_localization_wards_website_localizations_key_localization",
                table: "website_localization_wards");

            migrationBuilder.AddForeignKey(
                name: "fk_helpdesk_contents_helpdesk_catalogs_catalog_id",
                table: "helpdesk_contents",
                column: "catalog_id",
                principalTable: "helpdesk_catalogs",
                principalColumn: "catalog_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_website_localization_wards_website_localizations_key_localization",
                table: "website_localization_wards",
                column: "key_localization",
                principalTable: "website_localizations",
                principalColumn: "key_localization",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
