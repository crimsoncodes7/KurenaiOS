namespace Chat.Acceptance;

/// <summary>A chat client for the tests: a real TcpClient over loopback, a line at a time,
/// never waiting more than a few seconds for an answer.</summary>
public sealed class TestClient : IDisposable
{
    private readonly TcpClient tcp = new();
    private StreamReader reader = null!;
    private StreamWriter writer = null!;

    public static async Task<TestClient> ConnectAsync(int port)
    {
        var c = new TestClient();
        await c.tcp.ConnectAsync(IPAddress.Loopback, port);
        c.reader = new StreamReader(c.tcp.GetStream());
        c.writer = new StreamWriter(c.tcp.GetStream()) { AutoFlush = true };
        return c;
    }

    /// <summary>Connects, reads the welcome, and takes a name when one is given.</summary>
    public static async Task<TestClient> JoinAsync(int port, string? nick = null)
    {
        var c = await ConnectAsync(port);
        Assert.Equal("WELCOME KurenaiChat", await c.ReadAsync());
        if (nick is not null) Assert.Equal("OK " + nick, await c.AskAsync("NICK " + nick));
        return c;
    }

    public Task SendAsync(string line) => writer.WriteLineAsync(line);

    /// <summary>The next line, or null when the server has closed the connection.</summary>
    public async Task<string?> ReadAsync(int ms = 3000)
    {
        using var cts = new CancellationTokenSource(ms);
        try { return await reader.ReadLineAsync(cts.Token); }
        catch (OperationCanceledException) { throw new TimeoutException($"no line from the server within {ms} ms"); }
        catch (IOException) { return null; }
    }

    public async Task<string?> AskAsync(string line)
    {
        await SendAsync(line);
        return await ReadAsync();
    }

    /// <summary>True when nothing arrives for a while. Use it last: it leaves the reader unusable.</summary>
    public async Task<bool> QuietAsync(int ms = 300)
    {
        try
        {
            await ReadAsync(ms);
            return false;
        }
        catch (TimeoutException) { return true; }
    }

    public void Dispose() => tcp.Dispose();
}
