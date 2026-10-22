namespace Library;

/// <summary>Sends email. (Here it only prints; a real one would talk to a mail server.)</summary>
public class SmtpSender
{
    public void Send(string to, string text) => Console.WriteLine($"[smtp] to {to}: {text}");
}
