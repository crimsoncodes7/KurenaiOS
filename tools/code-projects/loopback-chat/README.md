# Loopback chat

The project of T1E, *Networking*, from KurenaiOS (Code → Track T1). A chat
server on `TcpListener` — an accept loop, a task per client, nicknames, a
broadcast and a clean stop — and a client, all over loopback (127.0.0.1):
your machine talking to itself, so nothing leaves it.

- `src/Chat` — `ChatServer` (a stub: yours to build).
- `src/Chat.Cli` — a client that starts its own server and talks to it.
- `tests/Chat.Tests` — YOUR tests. It starts with one example.
- `tests/Chat.Acceptance` — Kurenai's acceptance tests for milestones 1–4:
  real `TcpClient`s over loopback (`TestClient.cs`).

## Work on it

1. Open `LoopbackChat.sln` in JetBrains Rider (or run `dotnet test` here).
2. Do the milestones in `BRIEF.md`, in order.
3. Validate: run the **Kurenai Validate** configuration in Rider's toolbar, or
   `dotnet run .kurenai/validate.cs` in a terminal.
4. Import the newest file in `.kurenai/reports/` into KurenaiOS
   (Code → Loopback chat → Validation).

To talk to a server by hand, start one on a fixed port from a test or a
scratch program and connect with `nc 127.0.0.1 <port>` (macOS and Linux).

`Directory.Build.props`, `tests/Chat.Acceptance/` and `.kurenai/validate.cs`
are protected: change them and the report counts as practice only.
