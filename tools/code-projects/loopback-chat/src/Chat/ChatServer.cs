using System.Net;
using System.Net.Sockets;

namespace Chat;

/// <summary>A chat server on one address and port (0 = any free one). It speaks the line
/// protocol in BRIEF.md to every client at once. Milestones 1–4.</summary>
public sealed class ChatServer(IPAddress address, int port = 0) : IAsyncDisposable
{
    private readonly TcpListener listener = new(address, port);

    /// <summary>The port it listens on, once started.</summary>
    public int Port => ((IPEndPoint)listener.LocalEndpoint).Port;

    /// <summary>Starts listening, and accepts clients in the background; returns at once.</summary>
    public void Start()
    {
        throw new NotImplementedException();
    }

    /// <summary>Stops accepting, closes every client, and returns once the port is free.</summary>
    public Task StopAsync()
    {
        throw new NotImplementedException();
    }

    public async ValueTask DisposeAsync() => await StopAsync();
}
