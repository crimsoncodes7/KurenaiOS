/* Kurenai OS — data/content/code-t1e.js
   Code · T1 · Part E · Networking (docs/code-plan.md §3.3), done in Rider:
   sockets need a real network stack, so these run on your machine, over
   loopback (127.0.0.1), never the internet.

   IP, DNS and ports (T1.23), TCP and UDP (T1.24), sockets: a client and a
   server (T1.25). Rider form (smoke75); COMMAND cards. The part's project
   is "Loopback chat" (rp-t1e-chat; files from tools/code-projects/
   loopback-chat/). The Pitfalls messages are real runs' on macOS.         */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  var C = String.raw;
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function cs(cap, src) { return { code: { lang: "csharp", src: src, cap: cap } }; }
  function txt(cap, src) { return { code: { lang: "text", src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  var short = function (s) { s = String(s).replace(/^(Type the |Name the |Which |Write the )/, "").replace(/[.?…]$/, ""); return s.length > 52 ? s.slice(0, 50) + "…" : s; };

  K.add({ concepts: {
    "ip-dns-ports": { name: "IP, DNS and ports", lesson: "T1.23", about: "addresses, names, loopback and the port a program listens on" },
    "tcp-udp": { name: "TCP and UDP", lesson: "T1.24", about: "a reliable byte stream or fire-and-forget datagrams; framing" },
    "sockets": { name: "Sockets", lesson: "T1.25", about: "TcpListener and TcpClient, a task per client, a clean stop" }
  } });

  /* ================================================================
     T1.23 IP, DNS and ports
     ================================================================ */
  lesson("T1.23", {
    aqa: "4.9.4.3",
    notes: [
      page("The problem it solves"),
      { ul: [
        "T1D's `HttpClient` hid the network: you gave it `https://weather.example/v1/` and it answered. Underneath, three questions were answered first: **which machine** (an IP address), found from **a name** (DNS), and **which program** on it (a port).",
        "Knowing them is how you read the errors every networked program meets: *connection refused*, *address already in use*, *no such host*.",
        "This part runs in Rider, on **loopback**: your machine talking to itself, so nothing leaves it."
      ] },
      txt("from a URL to a program", "https://weather.example:443/v1/forecast/leeds\n        │               │\n        │               └ port 443 → the HTTPS server program\n        └ DNS: weather.example → 93.184.215.14 (IPv4) or 2606:2800:… (IPv6)"),
      page("Core idea"),
      cs("a name to its addresses", C`using System.Net;

foreach (IPAddress ip in await Dns.GetHostAddressesAsync("localhost"))
    Console.WriteLine($"localhost -> {ip} ({ip.AddressFamily})");`),
      sh("what that printed on a Mac", "localhost -> ::1 (InterNetworkV6)\nlocalhost -> 127.0.0.1 (InterNetwork)"),
      cs("an address and a port make an endpoint", C`var endpoint = new IPEndPoint(IPAddress.Loopback, 5050);
Console.WriteLine(endpoint);                  // 127.0.0.1:5050
Console.WriteLine(IPAddress.Parse("10.0.0.5").GetAddressBytes().Length);   // 4 bytes: IPv4`),
      { ul: [
        "An **IP address** names a network interface: IPv4 is 4 bytes (`192.168.1.42`), IPv6 16 bytes (`2001:db8::1`).",
        "**DNS** turns a name into addresses, asking servers in turn and caching the answers. One name can have several addresses — try each.",
        "A **port** (0–65535) picks the program: one machine runs many servers, each listening on its own port. An **endpoint** is the pair."
      ] },
      page("Rules"),
      { table: { head: ["Address", "Means"], rows: [
        ["`127.0.0.1`, `::1`", "**loopback**: this machine; traffic never reaches the network"],
        ["`10.x`, `172.16–31.x`, `192.168.x`", "**private**: inside a home or office network, not reachable from the internet (NAT translates)"],
        ["`0.0.0.0`, `::`", "*any*: listen on every interface — visible to the whole network"],
        ["anything else", "public, routed across the internet"]
      ] } },
      { table: { head: ["Port", "Usually"], rows: [
        ["22", "SSH"], ["53", "DNS"], ["80 / 443", "HTTP / HTTPS"], ["5432", "PostgreSQL"],
        ["1024–49151", "registered: your servers in development (5000, 8080)"],
        ["49152–65535", "**ephemeral**: the client's side of each connection, picked by the system"],
        ["0", "\"pick a free one for me\": the system chooses, and you ask which"]
      ] } },
      { ul: [
        "A **subnet mask** (`/24` = `255.255.255.0`) says how much of an address is the network: `192.168.1.42/24` is host 42 on network `192.168.1.0`.",
        "Only one program may listen on a given address and port at a time.",
        "Bind development servers to loopback, not *any*, unless other machines really must reach them."
      ] },
      page("Variations"),
      { h: "Is that address on my network?" },
      cs("IPNetwork does the subnet arithmetic", C`var lan = IPNetwork.Parse("192.168.1.0/24");
foreach (string s in new[] { "192.168.1.42", "192.168.2.7" })
    Console.WriteLine($"{s} in {lan}: {lan.Contains(IPAddress.Parse(s))}");
// 192.168.1.42 in 192.168.1.0/24: True
// 192.168.2.7 in 192.168.1.0/24: False`),
      { h: "Asking DNS from the terminal" },
      sh("nslookup (Windows, macOS, Linux) and dig", "nslookup github.com\ndig +short github.com"),
      { h: "Which program has that port?" },
      sh("macOS and Linux, then Windows", "lsof -i :5050\nnetstat -ano | findstr :5050"),
      page("Pitfalls"),
      { h: "Nothing is listening: connection refused" },
      txt("a client connecting to a port with no server", "System.Net.Sockets.SocketException (61): Connection refused"),
      "The machine answered, but no program listens on that port. Is the server running, on that port, and on that address (loopback vs the network)?",
      { h: "Two servers on one port: address already in use" },
      txt("the second TcpListener.Start() on the same port", "System.Net.Sockets.SocketException (48): Address already in use"),
      "Another program (often your own last run, still alive) holds it. Stop that one, pick another port, or ask for port 0 in tests.",
      { h: "A name DNS cannot find" },
      txt("Dns.GetHostAddressesAsync(\"no-such-host.invalid\") on macOS", "System.Net.Sockets.SocketException (00000005, 0xFFFDFFFF): nodename nor servname provided, or not known"),
      "A typo, no network, or a name only another network knows. Windows says *No such host is known*; the code is `SocketError.HostNotFound` everywhere.",
      page("Connections"),
      { ul: [ "**Back:** T1.18 the URL's parts; T1D's errors had these causes underneath.", "**Next:** T1.24 what travels between two endpoints; T1.25 a server on loopback.", "**AQA:** 4.9.4.3 IP address structure, 4.9.4.4 subnet masking, 4.9.4.6 public and private addresses; 4.9.4.5 IPv4 and IPv6." ] },
      page("Good practice"),
      { ul: [ "Development servers bind to loopback; tests ask for port 0.", "Try every address DNS returns, IPv6 and IPv4 (HttpClient and TcpClient do).", "Read the SocketErrorCode, not just the message: it is the same on every OS." ] },
      page("Practise"),
      { ul: [ "**Project:** *Loopback chat*, milestone 1 — a server on 127.0.0.1, port 0." ] },
      page("Quick reference"),
      cs("the pieces", C`IPAddress[] addresses = await Dns.GetHostAddressesAsync("example.com");
var endpoint = new IPEndPoint(IPAddress.Loopback, 0);     // port 0: any free one
bool home = IPNetwork.Parse("192.168.1.0/24").Contains(IPAddress.Parse("192.168.1.9"));`),
      { ul: [ "Loopback `127.0.0.1` / `::1`; private `10/8`, `172.16/12`, `192.168/16`; any `0.0.0.0`.", "Well-known ports: 22, 53, 80, 443; port 0 asks for a free one.", "`SocketError.ConnectionRefused` · `AddressAlreadyInUse` · `HostNotFound`." ] }
    ],
    flashcards: [
      ["What does DNS do?", "Turns a name (github.com) into IP addresses, asking DNS servers and caching the answer."],
      ["What is 127.0.0.1?", "The IPv4 loopback address: this machine, never the network (::1 in IPv6)."],
      ["What picks the program on a machine: the address or the port?", "The port; the address picks the machine (its interface)."],
      ["What does \"connection refused\" mean?", "The machine is there, but no program listens on that port (and address)."],
      ["Why ask for port 0?", "The system picks a free port, so tests never collide; ask the listener which it got."],
      ["Which ranges are private IPv4 addresses?", "10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16."]
    ],
    quiz: [
      { q: "A server listens on 127.0.0.1:5050. A phone on the same Wi-Fi connects to the laptop's 192.168.1.20:5050. It…", opts: ["connects", "is refused: the server only listens on loopback", "times out because of DNS", "connects to the phone itself"], ans: 1, why: "Loopback is reachable only from the same machine; listen on 0.0.0.0 (any) to be reachable on the network." },
      { q: "192.168.1.200 and 192.168.2.10 with mask /24 are…", opts: ["on the same network", "on different networks", "both public", "the same host"], ans: 1, why: "/24 compares the first three bytes: 1 ≠ 2." },
      { q: "Starting a second copy of your server fails with \"Address already in use\". Why?", opts: ["DNS failed", "the first copy still holds the port", "the firewall", "IPv6"], ans: 1, why: "One listener per address and port." }
    ]
  });

  /* ================================================================
     T1.24 TCP and UDP
     ================================================================ */
  lesson("T1.24", {
    aqa: "4.9.4.1",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Between two endpoints, data travels as small **packets**. Packets get lost, duplicated and arrive out of order.",
        "**TCP** hides all of that: a connection that delivers a **stream of bytes**, in order, complete — or tells you it broke. HTTP, SSH and databases use it.",
        "**UDP** does not: each **datagram** arrives whole or not at all, maybe out of order, with no connection. Games, video calls and DNS use it, because late data is useless data."
      ] },
      page("Core idea"),
      cs("TCP: a server, a client, a line each way", C`using System.Net;
using System.Net.Sockets;

var listener = new TcpListener(IPAddress.Loopback, 0);
listener.Start();
int port = ((IPEndPoint)listener.LocalEndpoint).Port;

var server = Task.Run(async () =>
{
    using TcpClient peer = await listener.AcceptTcpClientAsync();
    using var reader = new StreamReader(peer.GetStream());
    using var writer = new StreamWriter(peer.GetStream()) { AutoFlush = true };
    string? line = await reader.ReadLineAsync();
    await writer.WriteLineAsync($"you said: {line}");
});

using var client = new TcpClient();
await client.ConnectAsync(IPAddress.Loopback, port);
using var r = new StreamReader(client.GetStream());
using var w = new StreamWriter(client.GetStream()) { AutoFlush = true };
await w.WriteLineAsync("hello");
Console.WriteLine(await r.ReadLineAsync());   // you said: hello
await server;
listener.Stop();`),
      { ul: [
        "`ConnectAsync` makes the connection (TCP's three-way handshake); `AcceptTcpClientAsync` waits for one on the server.",
        "`GetStream()` is a `NetworkStream`: 11.1's streams, so `StreamReader` and `StreamWriter` work on it unchanged.",
        "`AutoFlush = true`: a writer buffers, and a line still in the buffer has not been sent."
      ] },
      cs("UDP: no connection, just datagrams", C`using var receiver = new UdpClient(new IPEndPoint(IPAddress.Loopback, 0));
int port = ((IPEndPoint)receiver.Client.LocalEndPoint!).Port;

using var sender = new UdpClient();
byte[] data = System.Text.Encoding.UTF8.GetBytes("score 42");
await sender.SendAsync(data, new IPEndPoint(IPAddress.Loopback, port));

UdpReceiveResult got = await receiver.ReceiveAsync();
Console.WriteLine($"{System.Text.Encoding.UTF8.GetString(got.Buffer)} from {got.RemoteEndPoint}");`),
      page("Rules"),
      { table: { head: ["", "TCP", "UDP"], rows: [
        ["Connection", "yes: connect, then talk", "none: send to an endpoint"],
        ["Delivery", "every byte, in order, or an error", "each datagram whole, or lost"],
        ["Shape", "a **stream** of bytes: no messages", "**messages** (datagrams), up to ~64 KB"],
        ["Cost", "handshake, acknowledgements, retransmission", "almost none"],
        ["Used by", "HTTP/1–2, SSH, SMTP, databases", "DNS, games, voice and video, QUIC (HTTP/3)"]
      ] } },
      { ul: [
        "TCP is a stream: two `Write`s may arrive as one `Read`, and one `Write` as two. You need **framing** — a newline after each message, or a length before it.",
        "A `NetworkStream.ReadAsync` returning 0 (`ReadLineAsync` returning `null`) means the other side closed the connection.",
        "In the TCP/IP stack, TCP and UDP are the **transport** layer, over IP (network), under HTTP and friends (application)."
      ] },
      page("Variations"),
      { h: "Framing by lines" },
      cs("a newline ends each message, however the bytes arrive", C`await writer.WriteAsync("NICK ana\nSAY hi");   // one write…
await writer.WriteAsync(" there\n");           // …and the rest later
// the reader still sees exactly two messages:
// "NICK ana"   then   "SAY hi there"`),
      { h: "Framing by length" },
      cs("four bytes of length, then the message", C`byte[] body = Encoding.UTF8.GetBytes(message);
await stream.WriteAsync(BitConverter.GetBytes(body.Length));
await stream.WriteAsync(body);

byte[] size = new byte[4];
await stream.ReadExactlyAsync(size);
byte[] got = new byte[BitConverter.ToInt32(size)];
await stream.ReadExactlyAsync(got);`),
      { h: "Watching it happen" },
      sh("nc (netcat) as a hand-typed client, macOS and Linux", "nc 127.0.0.1 5050"),
      page("Pitfalls"),
      { h: "One Read is not one message" },
      cs("works on loopback, breaks on a real network", C`byte[] buffer = new byte[1024];
int n = await stream.ReadAsync(buffer);
string message = Encoding.UTF8.GetString(buffer, 0, n);   // half a message, or two`),
      "TCP promises the bytes, not where `Read` cuts them. Frame the messages (a line, a length) and read until a whole one is there.",
      { h: "The line that never left" },
      cs("no AutoFlush: the client waits for an answer to a line still in its buffer", C`var w = new StreamWriter(client.GetStream());
await w.WriteLineAsync("PING");
string? answer = await r.ReadLineAsync();   // waits forever`),
      "`AutoFlush = true`, or `await w.FlushAsync()` after each message.",
      { h: "Expecting UDP to arrive" },
      "A UDP datagram can vanish without an error. If every message matters, use TCP — or number your datagrams and resend what is not acknowledged, which is building TCP again.",
      page("Connections"),
      { ul: [ "**Back:** 11.1 streams, readers and writers; T1.23 endpoints.", "**Next:** T1.25 a server for many clients at once.", "**AQA:** 4.9.4.1 the TCP/IP stack: application, transport, network and link layers, and sockets." ] },
      page("Good practice"),
      { ul: [ "Frame every message: lines for text protocols, a length prefix for binary.", "Flush after each message (or AutoFlush).", "TCP unless late data is worthless; then UDP, and expect losses." ] },
      page("Practise"),
      { ul: [ "**Project:** *Loopback chat*, milestones 1–2 — a line protocol over TCP." ] },
      page("Quick reference"),
      cs("the TCP pieces", C`var listener = new TcpListener(IPAddress.Loopback, 0); listener.Start();
TcpClient peer = await listener.AcceptTcpClientAsync();
using var client = new TcpClient(); await client.ConnectAsync(IPAddress.Loopback, port);
var reader = new StreamReader(client.GetStream());
var writer = new StreamWriter(client.GetStream()) { AutoFlush = true };`),
      { ul: [ "TCP: a connection, an ordered byte stream, no message boundaries.", "UDP: datagrams, no connection, no promises.", "`ReadLineAsync()` null = the other side closed." ] }
    ],
    flashcards: [
      ["TCP or UDP: a video call?", "UDP: a late frame is useless, so it is not worth resending."],
      ["What does TCP promise?", "Every byte, in order, without duplicates — or an error saying the connection broke."],
      ["Why does a TCP protocol need framing?", "TCP is a byte stream: reads do not line up with writes, so messages need a newline or a length."],
      ["What does ReadLineAsync returning null mean on a NetworkStream?", "The other side closed the connection."],
      ["Which layer are TCP and UDP in the TCP/IP stack?", "The transport layer."],
      ["Why set AutoFlush on a StreamWriter over a socket?", "Otherwise a message can sit in the buffer and never be sent."]
    ],
    quiz: [
      { q: "A client writes \"A\\n\" then \"B\\n\". The server's first ReadAsync returns…", opts: ["exactly \"A\\n\"", "anything from \"A\" to \"A\\nB\\n\"", "\"B\\n\" first", "nothing until both are sent"], ans: 1, why: "TCP keeps order, not boundaries." },
      { q: "Which suits a multiplayer game's position updates?", opts: ["TCP", "UDP", "SMTP", "HTTP/1.1"], ans: 1, why: "The next update replaces a lost one; waiting for a resend only adds lag." },
      { q: "A server's ReadLineAsync returns null. It should…", opts: ["retry the read", "treat the client as gone and clean up", "send a newline", "throw"], ans: 1, why: "Null is end of stream: the client closed." }
    ]
  });

  /* ================================================================
     T1.25 Sockets: a client and a server
     ================================================================ */
  lesson("T1.25", {
    aqa: "4.9.4.10",
    notes: [
      page("The problem it solves"),
      { ul: [
        "T1.24's server took one client, answered one line and stopped. A real server waits for clients forever, serves many at once, and shuts down cleanly when asked.",
        "That is three ideas: an **accept loop**, a **task per client**, and **cancellation** that ends both.",
        "It is the client–server model of every chat, game and web server; ASP.NET Core (T1F) is a very polished version of this loop."
      ] },
      page("Core idea"),
      cs("the accept loop: one task per client", C`public sealed class EchoServer(IPAddress address, int port = 0) : IAsyncDisposable
{
    private readonly TcpListener listener = new(address, port);
    private readonly CancellationTokenSource stop = new();
    private Task loop = Task.CompletedTask;

    public int Port => ((IPEndPoint)listener.LocalEndpoint).Port;

    public void Start()
    {
        listener.Start();
        loop = AcceptLoop(stop.Token);
    }

    private async Task AcceptLoop(CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            TcpClient client;
            try { client = await listener.AcceptTcpClientAsync(token); }
            catch (OperationCanceledException) { break; }
            _ = Serve(client, token);           // not awaited: the loop goes back to accepting
        }
    }

    private static async Task Serve(TcpClient client, CancellationToken token)
    {
        using (client)
        {
            var reader = new StreamReader(client.GetStream());
            var writer = new StreamWriter(client.GetStream()) { AutoFlush = true };
            try
            {
                string? line;
                while ((line = await reader.ReadLineAsync(token)) is not null)
                    await writer.WriteLineAsync(line.ToUpperInvariant());
            }
            catch (Exception e) when (e is IOException or OperationCanceledException) { }
        }
    }

    public async ValueTask DisposeAsync()
    {
        stop.Cancel();
        listener.Stop();
        await loop;
    }
}`),
      { ul: [
        "`Serve` is started and **not awaited**: while one client talks, the loop is already waiting for the next.",
        "Every client's `ReadLineAsync` takes the server's token, so stopping the server ends every conversation too.",
        "A client that vanishes mid-line shows up as an `IOException`: that client's problem, caught in its own task, never the server's."
      ] },
      cs("using it, in a test", C`await using var server = new EchoServer(IPAddress.Loopback);
server.Start();
using var client = new TcpClient();
await client.ConnectAsync(IPAddress.Loopback, server.Port);
var w = new StreamWriter(client.GetStream()) { AutoFlush = true };
await w.WriteLineAsync("hello");
Assert.Equal("HELLO", await new StreamReader(client.GetStream()).ReadLineAsync());`),
      page("Rules"),
      { ul: [
        "Accept in a loop; serve each client in its own task; never block the loop on one client.",
        "Shared state (the list of connected clients) is touched by many tasks at once: guard it with a `lock`, or use `ConcurrentDictionary`.",
        "**Broadcast** = write to every connected client; one slow or dead client must not stop the others (catch per client, and drop the dead one).",
        "A protocol is a contract: write it down — the commands, the answers, what happens on a mistake — and test it line by line.",
        "Stop cleanly: cancel the token, stop the listener, close every client, and only then return. A port left open fails the next run with *address already in use*."
      ] },
      { table: { head: ["Step", "Server", "Client"], rows: [
        ["1", "`new TcpListener(address, port).Start()`", ""],
        ["2", "`await AcceptTcpClientAsync(token)`", "`await ConnectAsync(address, port)`"],
        ["3", "`Serve(client)` in a new task; back to 2", "read and write lines"],
        ["4", "cancel, `Stop()`, close clients", "`Dispose()`: the server reads null"]
      ] } },
      page("Variations"),
      { h: "Many clients: a broadcast" },
      cs("every connected writer, guarded by a lock", C`private readonly Dictionary<TcpClient, StreamWriter> clients = new();
private readonly object gate = new();

private async Task Broadcast(string line)
{
    StreamWriter[] all;
    lock (gate) all = clients.Values.ToArray();     // copy, then write outside the lock
    foreach (var w in all)
    {
        try { await w.WriteLineAsync(line); }
        catch (IOException) { /* that client is gone; its own task removes it */ }
    }
}`),
      { h: "A client that reads and types at once" },
      cs("one task prints what arrives while the main loop sends what you type", C`var printer = Task.Run(async () =>
{
    string? line;
    while ((line = await reader.ReadLineAsync()) is not null) Console.WriteLine(line);
});
string? typed;
while ((typed = Console.ReadLine()) is not null) await writer.WriteLineAsync(typed);
await printer;`),
      { h: "Talking to it by hand" },
      sh("connect with netcat and type the protocol", "nc 127.0.0.1 5050\nNICK ana\nSAY hello"),
      page("Pitfalls"),
      { h: "Awaiting each client in the loop" },
      cs("the second client waits until the first one leaves", C`while (true)
{
    var client = await listener.AcceptTcpClientAsync();
    await Serve(client);      // the loop is stuck here while this client is connected
}`),
      "Start `Serve` without awaiting it (`_ = Serve(client, token);`), so the loop is back at `Accept` at once.",
      { h: "Changing the list while another task reads it" },
      txt("a broadcast that iterates the live dictionary while a client leaves", "System.InvalidOperationException: Collection was modified; enumeration operation may not execute."),
      "Copy under the lock, then write outside it — or use `ConcurrentDictionary`.",
      { h: "A dead client takes the server down" },
      "One client's laptop lid closes; the next broadcast to it throws `IOException`. Uncaught in the accept loop, it ends the server for everyone. Catch per client.",
      page("Connections"),
      { ul: [ "**Back:** 11.5–11.7 async, WhenAll and cancellation; T1.24 framing.", "**Next:** T1F, where ASP.NET Core runs this loop for you and you write only the endpoints.", "**AQA:** 4.9.4.10 the client–server model; 4.9.4.1 the role of sockets." ] },
      page("Good practice"),
      { ul: [ "Port 0 and loopback in tests: they never collide and never leave the machine.", "A task per client, errors caught per client, shared state under a lock.", "`IAsyncDisposable` on the server, so `await using` stops it even when a test fails." ] },
      page("Practise"),
      { ul: [ "**Project:** *Loopback chat* — the accept loop, nicknames, broadcast and a clean stop, tested over loopback." ] },
      page("Quick reference"),
      cs("the server's shape", C`listener.Start();
while (!token.IsCancellationRequested)
{
    var client = await listener.AcceptTcpClientAsync(token);
    _ = Serve(client, token);
}`),
      { ul: [ "Accept loop + a task per client + one token to stop them all.", "Broadcast from a copy of the client list; catch per client.", "`await using var server = …; server.Start();` in every test." ] }
    ],
    flashcards: [
      ["Why is Serve(client) not awaited in the accept loop?", "So the loop goes straight back to accepting: each client gets its own task."],
      ["How does one token stop the whole server?", "The accept loop and every client's reads take it; cancelling ends them all."],
      ["What must happen to shared state touched by many client tasks?", "A lock (or a concurrent collection), so two tasks never change it at once."],
      ["What does a broadcast do when one client has gone?", "Catches that client's IOException and carries on with the others."],
      ["What does the client–server model mean?", "Clients connect to a server that listens, and ask; the server answers many clients."],
      ["Why make a server IAsyncDisposable?", "So `await using` stops it and frees its port even when a test fails."]
    ],
    quiz: [
      { q: "With `await Serve(client)` inside the accept loop, a second client…", opts: ["is served in parallel", "waits until the first disconnects", "is refused", "crashes the server"], ans: 1, why: "The loop is not accepting while it awaits one client." },
      { q: "A broadcast iterates the clients while a client leaves on another task. The fix is…", opts: ["Thread.Sleep", "copy the list under a lock (or a ConcurrentDictionary)", "a try/finally", "UDP"], ans: 1, why: "Never enumerate a collection another task may change." },
      { q: "A test's server is never stopped. The next test's server on the same fixed port…", opts: ["shares it", "fails: address already in use", "gets port 0", "waits"], ans: 1, why: "Stop servers (await using) and use port 0 in tests." }
    ]
  });

  /* ================================================================
     retrieval cards (command cards) for T1E
     ================================================================ */
  K.add({ cards: {
    "t1e-addresses": { title: "Addresses and ports", lesson: "T1.23", concepts: ["ip-dns-ports"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the IPv4 loopback address.", "127.0.0.1", ["^127\\.0\\.0\\.1$"]],
          ["Type the IPv6 loopback address.", "::1", ["^(::1|0:0:0:0:0:0:0:1)$"]],
          ["Which port does HTTPS use by default?", "443", ["^443$"]],
          ["Which port does DNS use?", "53", ["^53$"]],
          ["Which port number asks the system for any free port?", "0", ["^0$"]],
          ["Type the subnet mask that /24 means, in dotted form.", "255.255.255.0", ["^255\\.255\\.255\\.0$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], hint: "Loopback 127.0.0.1 / ::1 · HTTPS 443 · DNS 53 · port 0 · /24 = 255.255.255.0." };
      } },
    "t1e-dns": { title: "Names and tools", lesson: "T1.23", concepts: ["ip-dns-ports"], kind: "command",
      vary: function (r) {
        var host = pick(r, ["github.com", "example.org", "kurenai-os.pages.dev"]), port = pick(r, ["5050", "8080", "5000"]);
        var q = pick(r, [
          ["Type the terminal command that asks DNS for " + host + "'s addresses with nslookup.", "nslookup " + host, ["^nslookup " + host.replace(/\./g, "\\.") + "$"]],
          ["Type the C# call (awaited) that gets " + host + "'s addresses from DNS.", "await Dns.GetHostAddressesAsync(\"" + host + "\")", ["^(var \\w+ = )?await (System\\.Net\\.)?Dns\\.GetHostAddressesAsync\\(\"" + host.replace(/\./g, "\\.") + "\"\\);?$"]],
          ["Type the macOS or Linux command that shows which program uses port " + port + ", with lsof.", "lsof -i :" + port, ["^(sudo )?lsof -i ?:" + port + "$"]],
          ["Which SocketError code means no program listens on that port?", "ConnectionRefused", ["^(SocketError\\.)?ConnectionRefused$"]],
          ["Which SocketError code means another program already listens on the port?", "AddressAlreadyInUse", ["^(SocketError\\.)?AddressAlreadyInUse$"]]
        ]);
        return { prompt: q[0], label: short(q[0]).replace(host, "a host").replace(port, "a port"), params: [host, port], answer: q[1], accept: q[2], hint: "nslookup · Dns.GetHostAddressesAsync · lsof -i :PORT · ConnectionRefused · AddressAlreadyInUse." };
      } },
    "t1e-sockets": { title: "Sockets in C#", lesson: "T1.25", concepts: ["tcp-udp", "sockets"], kind: "command",
      vary: function (r) {
        var q = pick(r, [
          ["Type the line that makes a TcpListener called listener on the loopback address, any free port.", "var listener = new TcpListener(IPAddress.Loopback, 0);", ["^(var listener|TcpListener listener) = new TcpListener\\(IPAddress\\.Loopback, ?0\\);?$"]],
          ["Which TcpListener method waits for the next client (the async one)?", "AcceptTcpClientAsync", ["^(listener\\.)?AcceptTcpClientAsync(\\(.*\\))?;?$"]],
          ["Type the expression that reads the port a started TcpListener called listener got.", "((IPEndPoint)listener.LocalEndpoint).Port", ["^\\(\\(IPEndPoint\\) ?listener\\.LocalEndpoint\\)\\.Port;?$"]],
          ["Which TcpClient method gives the stream to read and write?", "GetStream", ["^(client\\.)?GetStream(\\(\\))?;?$"]],
          ["Which StreamWriter property sends each write at once?", "AutoFlush", ["^(writer\\.)?AutoFlush( = true)?;?$"]],
          ["Which UdpClient method waits for the next datagram (the async one)?", "ReceiveAsync", ["^(\\w+\\.)?ReceiveAsync(\\(.*\\))?;?$"]]
        ]);
        return { prompt: q[0], label: short(q[0]), params: [], answer: q[1], accept: q[2], hint: "new TcpListener(IPAddress.Loopback, 0) · AcceptTcpClientAsync · LocalEndpoint · GetStream · AutoFlush · ReceiveAsync." };
      } }
  } });

  /* ================================================================
     the part's project, in Rider: Loopback chat
     ================================================================ */
  K.project("rp-t1e-chat", {
    unit: "T1E", title: "Loopback chat", folder: "loopback-chat", solution: "LoopbackChat.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "A chat server on TcpListener — an accept loop, a task per client, nicknames, a broadcast and a clean stop — and a client, tested over loopback, built in Rider.",
    brief: [
      "A chat server and client that talk a line protocol over TCP on your own machine. `src/Chat` (the `ChatServer` — yours to build) and `src/Chat.Cli` (a client that starts its own server on loopback), `tests/Chat.Tests` for your tests, and Kurenai's acceptance tests (`tests/Chat.Acceptance`), which connect real `TcpClient`s over loopback for milestones 1–3.",
      { h: "The protocol (one UTF-8 line each way)" },
      { table: { head: ["Client sends", "Server answers"], rows: [
        ["(connecting)", "`WELCOME KurenaiChat`"],
        ["`PING`", "`PONG`"],
        ["`NICK <name>`", "`OK <name>`, and the other named clients get `JOIN <name>`; `ERR bad name` (1–16 letters, digits, `_` or `-`); `ERR name taken` (case-sensitive); `ERR already named` for a second NICK"],
        ["`SAY <text>`", "every named client, the sender too: `MSG <name>: <text>`; before NICK: `ERR NICK first`"],
        ["`WHO`", "`USERS a, b` (names A–Z; `USERS` alone when nobody is named)"],
        ["`QUIT`", "`BYE`, then the server closes it; others get `LEAVE <name>`"],
        ["anything else", "`ERR unknown command`"]
      ] } },
      { ul: [
        "A client that disconnects without QUIT is treated as if it had quit: the others get `LEAVE <name>`, and the server carries on.",
        "`Directory.Build.props`, `tests/Chat.Acceptance/` and `.kurenai/validate.cs` are **protected**."
      ] }
    ],
    milestones: [
      { id: "m1", title: "One client over loopback", lessons: ["T1.23", "T1.24"], about: "Listen on 127.0.0.1, port 0; WELCOME, PING → PONG, QUIT → BYE and closed; unknown commands answered.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Many clients, with names", lessons: ["T1.25"], about: "An accept loop with a task per client: one quiet client never blocks another; NICK and WHO.", checks: [{ type: "tests", class: "Milestone2" }] },
      { id: "m3", title: "Broadcast", lessons: ["T1.25"], about: "SAY to every named client, JOIN and LEAVE, and a vanished client survived.", checks: [{ type: "tests", class: "Milestone3" }, { type: "source", path: "src/Chat", contains: ["lock\\s*\\(|Concurrent"] }] },
      { id: "m4", title: "A clean stop, a client, tested and committed", lessons: ["T1.23", "T1.24", "T1.25"], about: "Stopping closes every client and frees the port; the CLI talks to its own server; five or more of your own tests; no warnings; committed.",
        checks: [
          { type: "tests", class: "Milestone4" },
          { type: "run", project: "src/Chat.Cli", stdin: "NICK ana\nPING\nSAY hello there\nWHO\nNICK bo b\nQUIT\n", contains: ["WELCOME KurenaiChat", "OK ana", "PONG", "MSG ana: hello there", "USERS ana", "ERR bad name", "BYE"] },
          { type: "owntests", prefix: "Chat.Tests.", min: 5 }, { type: "warnings", max: 0 }, { type: "git" }
        ] }
    ],
    protected: ["Directory.Build.props", "tests/Chat.Acceptance/Chat.Acceptance.csproj", "tests/Chat.Acceptance/TestClient.cs", "tests/Chat.Acceptance/Milestone1.cs", "tests/Chat.Acceptance/Milestone2.cs", "tests/Chat.Acceptance/Milestone3.cs", "tests/Chat.Acceptance/Milestone4.cs", ".kurenai/validate.cs"],
    reward: { xp: 120, gold: 30, hp: 8 }
  });
})();
