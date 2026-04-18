namespace BeautyBooking.DTO.Request
{
    public class UpdateServiceRequest
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public IFormFile? ImageUrl { get; set; }
        public string? Description { get; set; }
    }
}
