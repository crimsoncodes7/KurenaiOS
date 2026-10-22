namespace Library;

/// <summary>Anything that can send a message to someone.</summary>
public interface INotifier
{
    void Send(string to, string text);
}
