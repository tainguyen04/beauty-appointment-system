namespace BeautyBooking.DTO.Response
{
    public class ServiceResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public string ImageUrl { get; set; }
        public string? CategoryName { get; set; }
    }
}
