namespace BeautyBooking.AI.Interfaces
{
    public interface IAIProvider
    {
        Task<string> GenerateResponseAsync(string prompt, CancellationToken cancellationToken = default);
    }
}
