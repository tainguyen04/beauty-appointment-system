namespace BeautyBooking.DTO.Request
{
    public class CreateServiceRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public string? ImageUrl { get; set; }
    }
}
