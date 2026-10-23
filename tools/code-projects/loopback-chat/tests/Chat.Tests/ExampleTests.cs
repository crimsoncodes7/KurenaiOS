namespace Chat.Tests;

public class ExampleTests
{
    [Fact]
    public async Task A_server_can_be_started_and_stopped()
    {
        await using var server = new ChatServer(IPAddress.Loopback);
        server.Start();
        Assert.True(server.Port > 0);
    }
}
