using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class RefactorRagMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "embedding_dimensions",
                table: "knowledge_documents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "embedding_model",
                table: "knowledge_documents",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "indexed_at",
                table: "knowledge_documents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_documents_embedding_model_embedding_dimensions",
                table: "knowledge_documents",
                columns: new[] { "embedding_model", "embedding_dimensions" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_knowledge_documents_embedding_model_embedding_dimensions",
                table: "knowledge_documents");

            migrationBuilder.DropColumn(
                name: "embedding_dimensions",
                table: "knowledge_documents");

            migrationBuilder.DropColumn(
                name: "embedding_model",
                table: "knowledge_documents");

            migrationBuilder.DropColumn(
                name: "indexed_at",
                table: "knowledge_documents");
        }
    }
}
