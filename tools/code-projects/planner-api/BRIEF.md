# The Planner goes online — brief

The revision planner's topics and study sessions, served as a REST API.

## The API

Every route under `/topics` needs the header `X-Api-Key` equal to the
configuration value `Planner:ApiKey`; anything else is `401`. `/health`
needs no key. With no key configured, nothing under `/topics` is open.

| Request | Answer |
|---|---|
| `GET /health` | `200` `{"status":"ok"}` |
| `GET /topics` (`?subject=cs`, any case) | `200`, the topics in id order |
| `GET /topics/{id}` | `200` the topic; `404` |
| `POST /topics` | `201`, `Location: /topics/{id}`, the topic; `400` invalid |
| `PUT /topics/{id}` | `204` (its last-studied day kept); `404`; `400` invalid |
| `DELETE /topics/{id}` | `204` (its sessions go too); `404` |
| `GET /topics/{id}/sessions` | `200`, by date then id; `404` with no such topic |
| `POST /topics/{id}/sessions` | `201`, `Location: /topics/{id}/sessions/{sid}`, the session; `404`; `400` |

A topic is `{"id":1,"subject":"cs","title":"Big O","confidence":3,"lastStudied":null}`
(`lastStudied` the latest session's date, `"2026-10-20"`); a session is
`{"id":1,"topicId":1,"date":"2026-10-20","minutes":25}`. A request sends a
topic as `{"subject":…,"title":…,"confidence":…}` and a session as
`{"date":…,"minutes":…}`. An id that is not a number is not a route (`404`).

**Validation** answers `400` with problem details (`application/problem+json`,
`Results.ValidationProblem`), one entry in `errors` per field:

| Field | Rule | Message |
|---|---|---|
| `subject` | not blank; stored trimmed, in lower case | `Choose a subject.` |
| `title` | not blank; stored trimmed | `Give the topic a title.` |
| `title` | at most 60 characters | `At most 60 characters.` |
| `confidence` | 1 to 5 | `Confidence is 1 to 5.` |
| `minutes` | 1 to 600 | `Minutes are 1 to 600.` |

## Milestones

1. **The endpoints.** Health, list, read, create, replace and delete.
2. **Validation and the right codes.** Problem details, tidy input, the
   subject filter, `{id:int}` routes.
3. **Persisted, with sessions.** EF Core on SQLite, the connection string
   `ConnectionStrings:Planner` from configuration, the database made by
   **migrations** (`dotnet ef migrations add …`, applied at start-up with
   `Database.Migrate()`); topics survive a restart; the sessions
   sub-resource; deleting a topic deletes its sessions.
4. **Locked with a key.** The `X-Api-Key` check on every `/topics` route
   (an endpoint filter on the route group, or middleware), the key read
   from `Planner:ApiKey` — user secrets in development, never a file here.
5. **Tested end to end and committed.** At least six of your own tests in
   `tests/Planner.Tests`, through `WebApplicationFactory`; no compiler
   warnings; committed with Git.
