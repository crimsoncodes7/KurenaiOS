namespace Chat.Acceptance;

/// <summary>Milestone 1 · one client over loopback: welcome, PING, unknown commands, QUIT.</summary>
public class Milestone1
{
    [Fact]
    public async Task It_listens_on_loopback_on_a_free_port()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        Assert.InRange(server.Port, 1, 65535);
        using var client = await TestClient.ConnectAsync(server.Port);
    }

    [Fact]
    public async Task Two_servers_get_different_ports()
    {
        await using var a = new ChatServer(IPAddress.Loopback);
        await using var b = new ChatServer(IPAddress.Loopback);
        a.Start();
        b.Start();
        Assert.NotEqual(a.Port, b.Port);
    }

    [Fact]
    public async Task A_client_is_welcomed()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.ConnectAsync(server.Port);
        Assert.Equal("WELCOME KurenaiChat", await client.ReadAsync());
    }

    [Fact]
    public async Task PING_is_answered_PONG_every_time()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.JoinAsync(server.Port);
        for (int i = 0; i < 3; i++) Assert.Equal("PONG", await client.AskAsync("PING"));
    }

    [Theory]
    [InlineData("HELLO")]
    [InlineData("ping")]
    [InlineData("")]
    public async Task An_unknown_command_is_answered(string line)
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.JoinAsync(server.Port);
        Assert.Equal("ERR unknown command", await client.AskAsync(line));
        Assert.Equal("PONG", await client.AskAsync("PING"));
    }

    [Fact]
    public async Task QUIT_says_BYE_and_the_server_closes_the_connection()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.JoinAsync(server.Port);
        Assert.Equal("BYE", await client.AskAsync("QUIT"));
        Assert.Null(await client.ReadAsync());
    }
}
