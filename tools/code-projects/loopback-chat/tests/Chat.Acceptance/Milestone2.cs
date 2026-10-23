namespace Chat.Acceptance;

/// <summary>Milestone 2 · many clients at once, with names.</summary>
public class Milestone2
{
    [Fact]
    public async Task A_quiet_client_never_blocks_another()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var quiet = await TestClient.JoinAsync(server.Port);
        using var busy = await TestClient.JoinAsync(server.Port);
        Assert.Equal("PONG", await busy.AskAsync("PING"));
        using var third = await TestClient.JoinAsync(server.Port);
        Assert.Equal("PONG", await third.AskAsync("PING"));
    }

    [Fact]
    public async Task NICK_names_a_client()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.JoinAsync(server.Port);
        Assert.Equal("OK ana", await client.AskAsync("NICK ana"));
    }

    [Fact]
    public async Task A_name_in_use_is_refused()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        using var other = await TestClient.JoinAsync(server.Port);
        Assert.Equal("ERR name taken", await other.AskAsync("NICK ana"));
        Assert.Equal("OK ana_2", await other.AskAsync("NICK ana_2"));
    }

    [Theory]
    [InlineData("NICK")]
    [InlineData("NICK bo b")]
    [InlineData("NICK ana!")]
    [InlineData("NICK abcdefghijklmnopq")]
    public async Task A_bad_name_is_refused(string line)
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.JoinAsync(server.Port);
        Assert.Equal("ERR bad name", await client.AskAsync(line));
    }

    [Fact]
    public async Task A_second_NICK_is_refused()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.JoinAsync(server.Port, "ana");
        Assert.Equal("ERR already named", await client.AskAsync("NICK bo"));
    }

    [Fact]
    public async Task WHO_lists_the_named_clients_A_to_Z()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var nobody = await TestClient.JoinAsync(server.Port);
        Assert.Equal("USERS", await nobody.AskAsync("WHO"));
        using var zed = await TestClient.JoinAsync(server.Port, "zed");
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        Assert.Equal("USERS ana, zed", await nobody.AskAsync("WHO"));
    }

    [Fact]
    public async Task SAY_before_NICK_is_refused()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var client = await TestClient.JoinAsync(server.Port);
        Assert.Equal("ERR NICK first", await client.AskAsync("SAY hello"));
    }
}
