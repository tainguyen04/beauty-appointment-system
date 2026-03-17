using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class Tao_CSDL_L1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "helpdesk_catalogs",
                columns: table => new
                {
                    catalog_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    key_catalog = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    name_vn = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    url = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    is_actived = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_helpdesk_catalogs", x => x.catalog_id);
                });

            migrationBuilder.CreateTable(
                name: "website_localizations",
                columns: table => new
                {
                    key_localization = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    localization = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    is_actived = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_website_localizations", x => x.key_localization);
                });

            migrationBuilder.CreateTable(
                name: "helpdesk_contents",
                columns: table => new
                {
                    content_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    content_detail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    catalog_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_helpdesk_contents", x => x.content_id);
                    table.ForeignKey(
                        name: "fk_helpdesk_contents_helpdesk_catalogs_catalog_id",
                        column: x => x.catalog_id,
                        principalTable: "helpdesk_catalogs",
                        principalColumn: "catalog_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "website_localization_wards",
                columns: table => new
                {
                    ward_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ward_pid = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    name_en = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    full_name = table.Column<string>(type: "nvarchar(96)", maxLength: 96, nullable: false),
                    full_name_en = table.Column<string>(type: "nvarchar(96)", maxLength: 96, nullable: false),
                    latitude = table.Column<double>(type: "float", nullable: false),
                    longitude = table.Column<double>(type: "float", nullable: false),
                    key_localization = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    is_actived = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_website_localization_wards", x => x.ward_id);
                    table.ForeignKey(
                        name: "fk_website_localization_wards_website_localizations_key_localization",
                        column: x => x.key_localization,
                        principalTable: "website_localizations",
                        principalColumn: "key_localization",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_helpdesk_contents_catalog_id",
                table: "helpdesk_contents",
                column: "catalog_id");

            migrationBuilder.CreateIndex(
                name: "ix_website_localization_wards_key_localization",
                table: "website_localization_wards",
                column: "key_localization");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "helpdesk_contents");

            migrationBuilder.DropTable(
                name: "website_localization_wards");

            migrationBuilder.DropTable(
                name: "helpdesk_catalogs");

            migrationBuilder.DropTable(
                name: "website_localizations");
        }
    }
}
