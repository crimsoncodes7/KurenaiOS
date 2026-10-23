namespace Chat.Acceptance;

/// <summary>Milestone 3 · broadcast: SAY to every named client, JOIN and LEAVE, a vanished client survived.</summary>
public class Milestone3
{
    [Fact]
    public async Task Others_hear_a_JOIN()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        using var bo = await TestClient.JoinAsync(server.Port, "bo");
        Assert.Equal("JOIN bo", await ana.ReadAsync());
    }

    [Fact]
    public async Task SAY_reaches_every_named_client_the_sender_too()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        using var bo = await TestClient.JoinAsync(server.Port, "bo");
        Assert.Equal("JOIN bo", await ana.ReadAsync());
        await ana.SendAsync("SAY hello there, bo");
        Assert.Equal("MSG ana: hello there, bo", await ana.ReadAsync());
        Assert.Equal("MSG ana: hello there, bo", await bo.ReadAsync());
    }

    [Fact]
    public async Task A_client_without_a_name_hears_nothing()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var lurker = await TestClient.JoinAsync(server.Port);
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        await ana.SendAsync("SAY hi");
        Assert.Equal("MSG ana: hi", await ana.ReadAsync());
        Assert.True(await lurker.QuietAsync());
    }

    [Fact]
    public async Task QUIT_is_a_LEAVE_for_the_others()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        using var bo = await TestClient.JoinAsync(server.Port, "bo");
        Assert.Equal("JOIN bo", await ana.ReadAsync());
        Assert.Equal("BYE", await bo.AskAsync("QUIT"));
        Assert.Equal("LEAVE bo", await ana.ReadAsync());
        Assert.Equal("USERS ana", await ana.AskAsync("WHO"));
    }

    [Fact]
    public async Task A_client_that_vanishes_is_a_LEAVE_and_the_server_carries_on()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        var bo = await TestClient.JoinAsync(server.Port, "bo");
        Assert.Equal("JOIN bo", await ana.ReadAsync());
        bo.Dispose();
        Assert.Equal("LEAVE bo", await ana.ReadAsync());
        await ana.SendAsync("SAY still here");
        Assert.Equal("MSG ana: still here", await ana.ReadAsync());
        using var cy = await TestClient.JoinAsync(server.Port, "cy");
        Assert.Equal("JOIN cy", await ana.ReadAsync());
    }

    [Fact]
    public async Task Many_messages_arrive_whole_and_in_order()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        using var ana = await TestClient.JoinAsync(server.Port, "ana");
        using var bo = await TestClient.JoinAsync(server.Port, "bo");
        Assert.Equal("JOIN bo", await ana.ReadAsync());
        for (int i = 1; i <= 50; i++) await ana.SendAsync($"SAY line {i}");
        for (int i = 1; i <= 50; i++) Assert.Equal($"MSG ana: line {i}", await bo.ReadAsync());
    }
}
