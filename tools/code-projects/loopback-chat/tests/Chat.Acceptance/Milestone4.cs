using System.Diagnostics;

namespace Chat.Acceptance;

/// <summary>Milestone 4 · a clean stop: every client closed, the port free, and quickly.</summary>
public class Milestone4
{
    [Fact]
    public async Task Stopping_closes_every_client()
    {
        var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        using var idle = await TestClient.JoinAsync(server.Port);
        await server.StopAsync();
        Assert.Null(await ana.ReadAsync());
        Assert.Null(await idle.ReadAsync());
    }

    [Fact]
    public async Task Stopping_frees_the_port()
    {
        var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        int port = server.Port;
        using var client = await TestClient.JoinAsync(port, "ana");
        await server.StopAsync();
        var again = new TcpListener(IPAddress.Loopback, port);
        again.Start();
        again.Stop();
    }

    [Fact]
    public async Task Stopping_is_quick_even_with_idle_clients()
    {
        var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        var clients = new List<TestClient>();
        for (int i = 0; i < 5; i++) clients.Add(await TestClient.JoinAsync(server.Port));
        var clock = Stopwatch.StartNew();
        await server.StopAsync();
        Assert.InRange(clock.ElapsedMilliseconds, 0, 2000);
        clients.ForEach(c => c.Dispose());
    }

    [Fact]
    public async Task Nobody_can_connect_after_a_stop()
    {
        var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        int port = server.Port;
        await server.StopAsync();
        await Assert.ThrowsAnyAsync<SocketException>(() => TestClient.ConnectAsync(port));
    }
}
