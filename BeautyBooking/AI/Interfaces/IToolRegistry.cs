namespace BeautyBooking.AI.Interfaces
{
    public interface IToolRegistry
    {
        IReadOnlyCollection<ITool> GetAll();
        ITool Get(string name);
    }
}
