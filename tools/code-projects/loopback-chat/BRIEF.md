# Loopback chat — brief

`ChatServer(address, port)` listens on that address and port (0 = any free
one; `Port` says which it got). `Start()` returns at once and accepts
clients in the background; `StopAsync()` (and `DisposeAsync`) stops.

## The protocol

One UTF-8 line each way, ended by a newline. Commands are case-sensitive.

| Client sends | Server answers |
|---|---|
| (connecting) | `WELCOME KurenaiChat` |
| `PING` | `PONG` |
| `NICK <name>` | `OK <name>`, and every other named client gets `JOIN <name>`. `ERR bad name` unless the name is 1–16 letters, digits, `_` or `-`; `ERR name taken` if a connected client has it (names are case-sensitive); `ERR already named` for a second NICK |
| `SAY <text>` | every named client, the sender too, gets `MSG <name>: <text>` (the text exactly as sent); before NICK: `ERR NICK first` |
| `WHO` | `USERS ana, zed` — the named clients, A–Z (ordinal); `USERS` alone when nobody is named |
| `QUIT` | `BYE`, then the server closes the connection; the other named clients get `LEAVE <name>` |
| anything else | `ERR unknown command` |

A client that disconnects without QUIT is treated as if it had quit.

## Milestones

1. **One client over loopback.** Listen; welcome; PING, unknown commands
   and QUIT.
2. **Many clients, with names.** An accept loop with a task per client, so
   a quiet client never blocks another; NICK and WHO.
3. **Broadcast.** SAY, JOIN and LEAVE; a client that vanishes must not stop
   the server or the others. The clients are shared by many tasks: guard
   them with a `lock` (or a concurrent collection).
4. **A clean stop, a client, tested and committed.** `StopAsync` stops
   accepting, closes every client (each reads the end of the stream), and
   returns within two seconds with the port free for the next server.
   `src/Chat.Cli` starts a server on 127.0.0.1, port 0, connects to it,
   prints every line the server sends while sending every line typed, and
   ends when the server closes the connection. Also: at least five of your
   own tests, no compiler warnings, and the work committed with Git.
