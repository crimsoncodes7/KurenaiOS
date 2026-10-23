/* Kurenai OS — data/content/code-t1d.js
   Code · T1 · Part D · HTTP and REST (docs/code-plan.md §3.3), in the app
   on the FULL runtime (where: "sandbox", invariant 105), nullable on.

   The HTTP exchange (T1.18), HttpClient and JSON (T1.19), retries, timeouts
   and cancellation (T1.20), REST design (T1.21) and authentication (T1.22).
   The sandbox has no network, so every program brings its own FAKE SERVER:
   a few lines at its end, an HttpMessageHandler that answers like the real
   thing. HttpClient sends through it exactly as it would through the
   network, so the client code is the code a real app runs (in Rider the
   same handler is how its tests fake a server). Delays are short and far
   apart (100 ms or more), so the order of events is the same on every
   machine; nothing prints a measured time or the real date. Sources are
   String.raw templates, so C# reads as C#. The part's project is the
   Weather client, in Rider (rp-t1d-weather).                              */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  var C = String.raw;
  function run(id, cap, src, o) {
    o = typeof o === "string" ? { stdin: o } : (o || {});
    var r = { id: id, cap: cap, src: src, stdin: o.stdin || "" };
    if (o.fails) r.fails = true;
    return { run: r };
  }
  function sh(cap, src) { return { code: { lang: "shell", src: src, cap: cap } }; }
  function txt(cap, src) { return { code: { lang: "text", src: src, cap: cap } }; }
  function page(t) { return { page: t }; }
  function lesson(ref, o) { K.lesson(ref, o); }
  function pick(r, list) { return list[r(list.length)]; }
  function uses(re, msg, id) { return { id: id || "uses", test: function (s) { return re.test(s); }, msg: msg }; }
  function noUse(re, msg, id) { return { id: id || "avoid", test: function (s) { return !re.test(s); }, msg: msg }; }

  /* the fake servers: an answer per request, then (T1.19 on) an async answer
     that can read the request's body, then (T1.20) one that can take time */
  var FAKE = C`

class FakeServer(Func<HttpRequestMessage, HttpResponseMessage> answer) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        => Task.FromResult(answer(request));
}`;
  var FAKE_ASYNC = C`

class FakeServer(Func<HttpRequestMessage, Task<HttpResponseMessage>> answer) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        => answer(request);
}`;
  var FAKE_SLOW = C`

class FakeServer(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> answer) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        => answer(request, token);
}`;

  K.add({ concepts: {
    "http-exchange": { name: "Requests and responses", lesson: "T1.18", about: "the method, URL, headers and body of an HTTP exchange" },
    "http-status": { name: "Status codes", lesson: "T1.18", about: "2xx, 3xx, 4xx and 5xx, and what each promises" },
    "httpclient": { name: "HttpClient", lesson: "T1.19", about: "one shared client, a base address, sending requests" },
    "http-json": { name: "JSON over HTTP", lesson: "T1.19", about: "GetFromJsonAsync, PostAsJsonAsync, ReadFromJsonAsync" },
    "http-timeouts": { name: "Timeouts and cancellation", lesson: "T1.20", about: "HttpClient.Timeout, tokens, linked tokens" },
    "http-retries": { name: "Retries", lesson: "T1.20", about: "transient errors, backoff, Retry-After, idempotency" },
    "rest-design": { name: "REST design", lesson: "T1.21", about: "resources, methods, status codes, paging, problem details" },
    "http-auth": { name: "Authentication", lesson: "T1.22", about: "API keys, bearer tokens, 401 and 403, OAuth" },
    "jwt": { name: "JWTs", lesson: "T1.22", about: "the three parts of a token, its claims and expiry" }
  } });

  /* ================================================================
     T1.18 HTTP: methods, status codes and headers
     ================================================================ */
  lesson("T1.18", {
    aqa: "4.9.4.2",
    notes: [
      page("The problem it solves"),
      { ul: [
        "Almost every app talks to a server: the weather, a bank, KurenaiOS's own cloud sync. They nearly all speak **HTTP**: the client sends a **request**, the server sends back one **response**.",
        "Both are plain text with the same shape: a first line, **headers** (`Name: value`), a blank line, then an optional **body**.",
        "This part runs against a **fake server**: the few lines at the end of each listing, a class that answers requests like a real server would. The sandbox has no network, and a fake gives the same answer every run. Point the same client code at a real server and nothing else changes."
      ] },
      txt("one exchange, as it travels", "GET /books/42 HTTP/1.1\nHost: api.example\nAccept: application/json\n\nHTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n{\"id\":42,\"title\":\"Dune\"}"),
      page("Core idea"),
      run("request", "a request is a method, a URL and headers", C`var request = new HttpRequestMessage(HttpMethod.Get, "https://api.example/books/42?format=short");
request.Headers.Add("Accept", "application/json");
request.Headers.Add("X-Trace", "t-17");

Uri url = request.RequestUri!;
Console.WriteLine($"{request.Method} {url.PathAndQuery} HTTP/1.1");
Console.WriteLine($"Host: {url.Authority}");
foreach (var header in request.Headers)
    Console.WriteLine($"{header.Key}: {string.Join(", ", header.Value)}");`),
      { ul: [
        "The **method** says what to do (`GET`: read), the **URL** says to what: a host, a path (`/books/42`) and an optional query (`?format=short`).",
        "**Headers** add facts about the request: what format the client accepts, who it is, how it proves it may ask (T1.22).",
        "This is exactly the text the listing prints. `HttpClient` writes it for you; it is still worth being able to read."
      ] },
      run("send", "HttpClient sends it; the fake server answers", C`using System.Net;
using System.Text;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.OK)
{
    Content = new StringContent("{\"id\":42,\"title\":\"Dune\"}", Encoding.UTF8, "application/json")
}));

HttpResponseMessage response = await http.GetAsync("https://api.example/books/42");
Console.WriteLine($"HTTP/1.1 {(int)response.StatusCode} {response.ReasonPhrase}");
Console.WriteLine($"Content-Type: {response.Content.Headers.ContentType}");
Console.WriteLine();
Console.WriteLine(await response.Content.ReadAsStringAsync());` + FAKE),
      { ul: [
        "`GetAsync` sends a GET and awaits the whole response (11.5): a **status code**, headers and a body.",
        "`StatusCode` is the `HttpStatusCode` enum (`OK`); cast it for the number. `ReasonPhrase` is the words after it.",
        "The body is read separately, and asynchronously: `ReadAsStringAsync()`.",
        "The fake server: `new HttpClient(handler)` sends every request through that handler instead of the network. Ours calls the lambda, which builds the response."
      ] },
      page("Rules"),
      { table: { head: ["Method", "Means", "Safe", "Idempotent", "Body"], rows: [
        ["`GET`", "read the resource", "yes", "yes", "no"],
        ["`POST`", "create, or do something", "no", "**no**", "yes"],
        ["`PUT`", "replace it whole", "no", "yes", "yes"],
        ["`PATCH`", "change part of it", "no", "not promised", "yes"],
        ["`DELETE`", "remove it", "no", "yes", "rarely"]
      ] } },
      { ul: [
        "**Safe**: changes nothing on the server. **Idempotent**: sending it twice leaves the server as sending it once would — so it can be retried (T1.20)."
      ] },
      { table: { head: ["Class", "Means", "Common codes"], rows: [
        ["2xx", "success", "200 OK · 201 Created · 204 No Content"],
        ["3xx", "look elsewhere", "301 Moved Permanently · 304 Not Modified"],
        ["4xx", "the **client** got it wrong", "400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 429 Too Many Requests"],
        ["5xx", "the **server** failed", "500 Internal Server Error · 502 Bad Gateway · 503 Service Unavailable"]
      ] } },
      { ul: [
        "Request headers live on `request.Headers` (or `http.DefaultRequestHeaders` for every request); headers about the body (`Content-Type`, `Content-Length`) on `Content.Headers`.",
        "A 4xx or 5xx is still a **response**: `GetAsync` returns it normally. Only a failure to get any answer at all (no connection, a timeout) throws.",
        "`IsSuccessStatusCode` is true for 200–299; `EnsureSuccessStatusCode()` throws `HttpRequestException` otherwise."
      ] },
      page("Variations"),
      { h: "Every status code has a class" },
      run("classes", "the first digit is the verdict", C`using System.Net;

HttpStatusCode[] codes =
{
    HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.NoContent, HttpStatusCode.NotModified,
    HttpStatusCode.BadRequest, HttpStatusCode.NotFound, HttpStatusCode.TooManyRequests, HttpStatusCode.ServiceUnavailable
};
foreach (var code in codes)
{
    string kind = (int)code switch
    {
        < 300 => "success",
        < 400 => "redirect",
        < 500 => "client error",
        _ => "server error"
    };
    Console.WriteLine($"{(int)code} {code}: {kind}");
}`),
      { h: "Methods on one URL" },
      run("methods", "SendAsync sends any method", C`using System.Net;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(request.Method.Method switch
{
    "GET" => HttpStatusCode.OK,
    "POST" => HttpStatusCode.Created,
    "PUT" or "DELETE" => HttpStatusCode.NoContent,
    _ => HttpStatusCode.MethodNotAllowed
})));

foreach (var method in new[] { HttpMethod.Get, HttpMethod.Post, HttpMethod.Put, HttpMethod.Delete, HttpMethod.Patch })
{
    var response = await http.SendAsync(new HttpRequestMessage(method, "https://api.example/books"));
    Console.WriteLine($"{method,-6} /books -> {(int)response.StatusCode} {response.ReasonPhrase}");
}` + FAKE),
      { h: "Headers both ways" },
      run("headers", "the client sends who it is; the server sends a version tag", C`using System.Net;
using System.Net.Http.Headers;

var http = new HttpClient(new FakeServer(request =>
{
    string agent = string.Join(" ", request.Headers.UserAgent);
    var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent($"hello, {agent}") };
    response.Headers.ETag = new EntityTagHeaderValue("\"v7\"");
    response.Headers.Add("X-Request-Id", "r-1001");
    return response;
}));
http.DefaultRequestHeaders.UserAgent.ParseAdd("Kurenai/1.0");

var reply = await http.GetAsync("https://api.example/hello");
Console.WriteLine(await reply.Content.ReadAsStringAsync());
Console.WriteLine($"ETag: {reply.Headers.ETag}");
Console.WriteLine($"X-Request-Id: {reply.Headers.GetValues("X-Request-Id").First()}");
Console.WriteLine($"Content-Type: {reply.Content.Headers.ContentType}");` + FAKE),
      page("Pitfalls"),
      { h: "A status code is not an int — CS0266" },
      run("pit-int", "the enum needs a cast", C`using System.Net;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.NotFound)));
var response = await http.GetAsync("https://api.example/books/9");
int code = response.StatusCode;
Console.WriteLine(code);` + FAKE),
      "`int code = (int)response.StatusCode;` — or compare with the enum: `response.StatusCode == HttpStatusCode.NotFound`.",
      { h: "A 404 is an answer, not an exception" },
      run("pit-404", "GetAsync returns; EnsureSuccessStatusCode is what throws", C`using System.Net;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.NotFound)));
var response = await http.GetAsync("https://api.example/books/9");
Console.WriteLine($"no exception, but {(int)response.StatusCode}");
try
{
    response.EnsureSuccessStatusCode();
}
catch (HttpRequestException e)
{
    Console.WriteLine($"{e.StatusCode}: {e.Message}");
}` + FAKE),
      { h: "Sending a POST twice" },
      "GET, PUT and DELETE are idempotent: sent twice, the server ends up as if they were sent once. POST is not. If a POST times out it may still have worked, and sending it again can place two orders. T1.20 retries only what is safe to repeat.",
      page("Connections"),
      { ul: [ "**Back:** 11.5 async and await; 11.9 the downloader's fake server, behind an interface.", "**Next:** T1.19 JSON bodies with HttpClient; T1.21 choosing URLs and codes; T1F serves them with ASP.NET Core.", "**AQA:** 4.9.4.2 HTTP and HTTPS are application-layer protocols of the TCP/IP stack." ] },
      page("Good practice"),
      { ul: [ "Check the status before reading the body: an error page is a body too.", "Compare with the enum (`HttpStatusCode.NotFound`), not a magic number.", "Never retry a POST blindly." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Status report* and *Raw request*." ] },
      page("Quick reference"),
      run("qr", "send, then read the status", C`using System.Net;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.Accepted)));
var res = await http.PostAsync("https://api.example/jobs", new StringContent("go"));
Console.WriteLine($"{(int)res.StatusCode} {res.ReasonPhrase} {res.IsSuccessStatusCode}");` + FAKE),
      { ul: [ "`await http.GetAsync(url)` / `PostAsync(url, content)` / `SendAsync(request)`.", "`(int)response.StatusCode`, `ReasonPhrase`, `IsSuccessStatusCode`, `EnsureSuccessStatusCode()`.", "`request.Headers.Add(name, value)`; `response.Content.Headers.ContentType`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0266", "an HttpStatusCode used as an int without a cast", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: C`using System.Net;

foreach (int c in new[] { 200, 204, 299, 301, 404 })
    Console.Write(new HttpResponseMessage((HttpStatusCode)c).IsSuccessStatusCode + " ");
Console.WriteLine();`, why: "Success is exactly 200–299; a redirect is not a success.", concepts: ["http-status"] },
        { id: "p2", src: C`var r = new HttpRequestMessage(HttpMethod.Post, "https://api.example/a/b?x=1");
r.Content = new StringContent("hi");
Console.WriteLine($"{r.Method} {r.RequestUri!.AbsolutePath} {r.RequestUri.Query} {r.Content.Headers.ContentLength}");`, why: "The path and the query are separate parts of the URL; the body is two bytes.", concepts: ["http-exchange"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the status prints as a number.", src: C`using System.Net;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.NotFound)));
var response = await http.GetAsync("https://api.example/x");
int code = @@response.StatusCode;
Console.WriteLine(code);` + FAKE, out: "404", answer: "(int)", concepts: ["http-status"] }
      ],
      bug: [
        { id: "b1", q: "It should print found or missing for each book.", src: C`using System.Net;

var http = new HttpClient(new FakeServer(request =>
    new HttpResponseMessage(request.RequestUri!.AbsolutePath == "/books/1" ? HttpStatusCode.OK : HttpStatusCode.NotFound)));
foreach (int id in new[] { 1, 9 })
{
    try
    {
        var response = await http.GetAsync($"https://api.example/books/{id}");
        Console.WriteLine($"{id}: found");
    }
    catch (HttpRequestException)
    {
        Console.WriteLine($"{id}: missing");
    }
}` + FAKE, out: "1: found\n9: missing", fixedText: "prints 9: missing", why: "GetAsync does not throw for a 404, so the catch never runs. Check response.IsSuccessStatusCode (or call EnsureSuccessStatusCode inside the try).", concepts: ["http-status"] }
      ]
    },
    flashcards: [
      ["What are the four parts of an HTTP request?", "The method, the URL, the headers and an optional body."],
      ["What does a 4xx status mean, and a 5xx?", "4xx: the client got it wrong (bad input, not found, not allowed). 5xx: the server failed."],
      ["Does GetAsync throw for a 404?", "No: a 404 is a response. Check IsSuccessStatusCode, or EnsureSuccessStatusCode throws."],
      ["What does idempotent mean?", "Sending the request twice leaves the server as sending it once would: GET, PUT, DELETE."],
      ["Where is Content-Type read from a response?", "response.Content.Headers.ContentType — it describes the body."],
      ["201, 204 and 304?", "Created, No Content (success with no body), Not Modified (use your cached copy)."]
    ],
    quiz: [
      { q: "A server answers 503. Whose fault is it, and might trying later help?", opts: ["the client's; no", "the server's; yes", "the client's; yes", "nobody's; no"], ans: 1, why: "5xx is a server failure, and Service Unavailable is usually temporary." },
      { q: "Which method should NOT be repeated automatically after a timeout?", opts: ["GET", "PUT", "DELETE", "POST"], ans: 3, why: "POST is not idempotent: the first may have worked." },
      { q: "await http.GetAsync(url) for a missing page…", opts: ["throws HttpRequestException", "returns a response with StatusCode NotFound", "returns null", "hangs"], ans: 1, why: "Any answer from the server is a response; only no answer at all throws." }
    ]
  });
  K.add({ tasks: {
    "T1.18-status": { lesson: "T1.18", title: "Status report", tier: "core", minutes: 15, concepts: ["http-status", "http-exchange"],
      statement: ["Each line is `PATH CODE`. The fake server in the starter answers a GET for PATH with that status code.", "GET each path in turn and print `PATH CODE Reason (kind)`, where kind is success, redirect, client error or server error. Then print `ok S, other O`: S responses were a success."],
      starter: C`using System.Net;

var codes = new Dictionary<string, int>();
var paths = new List<string>();
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    string[] parts = line.Split(' ');
    codes[parts[0]] = int.Parse(parts[1]);
    paths.Add(parts[0]);
}
var http = new HttpClient(new FakeServer(request => new HttpResponseMessage((HttpStatusCode)codes[request.RequestUri!.AbsolutePath])))
{
    BaseAddress = new Uri("https://api.example")
};
` + FAKE,
      examples: [{ stdin: "/books 200\n/books/9 404\n/admin 403\n/old 301\n/busy 503", out: "/books 200 OK (success)\n/books/9 404 Not Found (client error)\n/admin 403 Forbidden (client error)\n/old 301 Moved Permanently (redirect)\n/busy 503 Service Unavailable (server error)\nok 1, other 4" }],
      hidden: [{ stdin: "/new 201\n/gone 410\n/err 500\n/same 204", out: "/new 201 Created (success)\n/gone 410 Gone (client error)\n/err 500 Internal Server Error (server error)\n/same 204 No Content (success)\nok 2, other 2" }, { stdin: "", out: "ok 0, other 0" }],
      rules: [uses(/GetAsync\s*\(/, "Send each request with GetAsync."), uses(/\(\s*int\s*\)\s*\w+\.StatusCode/, "Print the code as a number: (int)response.StatusCode.", "cast")],
      hints: ["foreach (string path in paths) { var response = await http.GetAsync(path); … }", "string kind = (int)response.StatusCode switch { < 300 => \"success\", < 400 => \"redirect\", < 500 => \"client error\", _ => \"server error\" };", "if (response.IsSuccessStatusCode) ok++;"],
      answer: C`using System.Net;

var codes = new Dictionary<string, int>();
var paths = new List<string>();
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    string[] parts = line.Split(' ');
    codes[parts[0]] = int.Parse(parts[1]);
    paths.Add(parts[0]);
}
var http = new HttpClient(new FakeServer(request => new HttpResponseMessage((HttpStatusCode)codes[request.RequestUri!.AbsolutePath])))
{
    BaseAddress = new Uri("https://api.example")
};
int ok = 0;
foreach (string path in paths)
{
    var response = await http.GetAsync(path);
    int code = (int)response.StatusCode;
    string kind = code switch
    {
        < 300 => "success",
        < 400 => "redirect",
        < 500 => "client error",
        _ => "server error"
    };
    if (response.IsSuccessStatusCode) ok++;
    Console.WriteLine($"{path} {code} {response.ReasonPhrase} ({kind})");
}
Console.WriteLine($"ok {ok}, other {paths.Count - ok}");` + FAKE },
    "T1.18-raw": { lesson: "T1.18", title: "Raw request", tier: "warm-up", minutes: 10, concepts: ["http-exchange"],
      statement: ["The first line is `METHOD URL`. The lines after it are headers, `Name: value`, until a blank line or the end.", "Build an `HttpRequestMessage` from them (each header with `request.Headers.Add`), then print it as it travels: `METHOD PATH-AND-QUERY HTTP/1.1`, then `Host: HOST` (with the port when the URL gives one), then each header as `Name: value`."],
      starter: C`string[] first = (Console.ReadLine() ?? "").Split(' ');
`,
      examples: [{ stdin: "GET https://api.example/books?page=2\nAccept: application/json\nX-Api-Key: k-123", out: "GET /books?page=2 HTTP/1.1\nHost: api.example\nAccept: application/json\nX-Api-Key: k-123" }],
      hidden: [{ stdin: "DELETE https://api.example:8443/books/7", out: "DELETE /books/7 HTTP/1.1\nHost: api.example:8443" }, { stdin: "POST http://localhost:5000/notes\nX-Trace: 9\n", out: "POST /notes HTTP/1.1\nHost: localhost:5000\nX-Trace: 9" }],
      rules: [uses(/new\s+HttpRequestMessage\s*\(/, "Build an HttpRequestMessage."), uses(/Headers\.Add\s*\(/, "Add each header with request.Headers.Add.", "headers")],
      hints: ["var request = new HttpRequestMessage(new HttpMethod(first[0]), first[1]);", "int colon = line.IndexOf(':'); request.Headers.Add(line[..colon], line[(colon + 1)..].Trim());", "Uri url = request.RequestUri!; url.PathAndQuery and url.Authority (the host, with a port that is not the default)."],
      answer: C`string[] first = (Console.ReadLine() ?? "").Split(' ');
var request = new HttpRequestMessage(new HttpMethod(first[0]), first[1]);
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    int colon = line.IndexOf(':');
    request.Headers.Add(line[..colon], line[(colon + 1)..].Trim());
}
Uri url = request.RequestUri!;
Console.WriteLine($"{request.Method} {url.PathAndQuery} HTTP/1.1");
Console.WriteLine($"Host: {url.Authority}");
foreach (var header in request.Headers)
    Console.WriteLine($"{header.Key}: {string.Join(", ", header.Value)}");` }
  } });

  /* ================================================================
     T1.19 HttpClient and JSON
     ================================================================ */
  lesson("T1.19", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "APIs send and receive **JSON** (11.2). Reading the body as text and calling `JsonSerializer` by hand works, but every call repeats the same three steps.",
        "**System.Net.Http.Json** adds one-call versions to `HttpClient`: `GetFromJsonAsync<T>`, `PostAsJsonAsync`, `ReadFromJsonAsync<T>`.",
        "And one `HttpClient`, made once with a **base address**, serves the whole program."
      ] },
      page("Core idea"),
      run("get-json", "GetFromJsonAsync: request, check, read and deserialise in one call", C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.OK)
{
    Content = JsonContent.Create(new { city = "Leeds", tempC = 11.5, summary = "rain" })
}))
{
    BaseAddress = new Uri("https://weather.example/v1/")
};

Forecast? today = await http.GetFromJsonAsync<Forecast>("forecast/leeds");
Console.WriteLine($"{today!.City}: {today.TempC} °C, {today.Summary}");

record Forecast(string City, double TempC, string Summary);` + FAKE),
      { ul: [
        "`using System.Net.Http.Json;` brings the JSON methods. They use the **web defaults**: camelCase names out, any case in — so `tempC` fills `TempC`.",
        "`BaseAddress` ends in `/`; each call then names only the rest of the path (`forecast/leeds`).",
        "`GetFromJsonAsync` throws `HttpRequestException` for a non-success status, so it suits calls that should always work."
      ] },
      run("post", "PostAsJsonAsync sends an object; the 201 says where it now lives", C`using System.Net;
using System.Net.Http.Json;

var notes = new List<Note>();
var http = new HttpClient(new FakeServer(async request =>
{
    var draft = await request.Content!.ReadFromJsonAsync<Draft>();
    var note = new Note(notes.Count + 1, draft!.Text);
    notes.Add(note);
    var response = new HttpResponseMessage(HttpStatusCode.Created) { Content = JsonContent.Create(note) };
    response.Headers.Location = new Uri($"https://notes.example/notes/{note.Id}");
    return response;
}))
{
    BaseAddress = new Uri("https://notes.example/")
};

HttpResponseMessage created = await http.PostAsJsonAsync("notes", new Draft("buy milk"));
Note? saved = await created.Content.ReadFromJsonAsync<Note>();
Console.WriteLine($"{(int)created.StatusCode} {created.Headers.Location}");
Console.WriteLine(saved);

record Draft(string Text);
record Note(int Id, string Text);` + FAKE_ASYNC),
      { ul: [
        "This fake server reads the request's body, which is asynchronous, so its answer is an `async` lambda.",
        "`PostAsJsonAsync(path, value)` serialises the value as the body and returns the whole response — check its status before trusting the body.",
        "`ReadFromJsonAsync<T>()` reads any body as a T: a response's, or (on the server) a request's."
      ] },
      page("Rules"),
      { table: { head: ["Call", "Sends", "Returns"], rows: [
        ["`GetFromJsonAsync<T>(path)`", "GET", "a `T?`; throws on a non-success status"],
        ["`GetAsync(path)` then `ReadFromJsonAsync<T>()`", "GET", "the response first, so you decide what a 404 means"],
        ["`PostAsJsonAsync(path, value)`", "POST, the value as JSON", "the response"],
        ["`PutAsJsonAsync(path, value)`", "PUT, the value as JSON", "the response"],
        ["`DeleteAsync(path)`", "DELETE", "the response"],
        ["`JsonContent.Create(value)`", "a JSON body for any request (or a fake's response)", "`HttpContent`"]
      ] } },
      { ul: [
        "Make **one** `HttpClient` and share it. Making one per request can run a machine out of network sockets; in a host, `IHttpClientFactory` hands them out.",
        "`BaseAddress` + relative path follows URL rules: keep the trailing `/` on the base and no leading `/` on the path (Pitfalls).",
        "Model the JSON with `record`s holding only what you use; extra JSON properties are ignored, missing ones are left at their defaults.",
        "Results are `T?`: a body of `null` gives null."
      ] },
      page("Variations"),
      { h: "A list, then LINQ" },
      run("list", "an array of objects arrives as a List", C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.OK)
{
    Content = JsonContent.Create(new[]
    {
        new { title = "Dune", year = 1965, onLoan = true },
        new { title = "Emma", year = 1815, onLoan = false },
        new { title = "Kim", year = 1901, onLoan = false }
    })
}));

List<Book> books = await http.GetFromJsonAsync<List<Book>>("https://library.example/books") ?? new();
Console.WriteLine($"{books.Count} books, {books.Count(b => !b.OnLoan)} on the shelf");
foreach (var b in books.OrderBy(b => b.Year)) Console.WriteLine($"{b.Year} {b.Title}");

record Book(string Title, int Year, bool OnLoan);` + FAKE),
      { h: "Look at the status first" },
      run("status", "GetAsync, then decide", C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(request => request.RequestUri!.AbsolutePath == "/v1/forecast/york"
    ? new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new { city = "York", tempC = 9.0 }) }
    : new HttpResponseMessage(HttpStatusCode.NotFound)))
{
    BaseAddress = new Uri("https://weather.example/v1/")
};

foreach (string city in new[] { "york", "atlantis" })
{
    var response = await http.GetAsync($"forecast/{city}");
    if (response.StatusCode == HttpStatusCode.NotFound)
    {
        Console.WriteLine($"{city}: no such city");
        continue;
    }
    var f = await response.Content.ReadFromJsonAsync<Forecast>();
    Console.WriteLine($"{f!.City}: {f.TempC} °C");
}

record Forecast(string City, double TempC);` + FAKE),
      { h: "JSON with no type for it" },
      run("node", "JsonNode walks what you were sent", C`using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.OK)
{
    Content = JsonContent.Create(new { current = new { temp = 12.5, wind = new { speed = 20, dir = "SW" } }, alerts = new[] { "fog" } })
}));

JsonNode? data = await http.GetFromJsonAsync<JsonNode>("https://weather.example/now");
Console.WriteLine(data!["current"]!["temp"]!.GetValue<double>());
Console.WriteLine(data["current"]!["wind"]!["dir"]);
Console.WriteLine(data["alerts"]!.AsArray().Count + " alert(s)");` + FAKE),
      { h: "Replace and remove" },
      run("put", "PutAsJsonAsync and DeleteAsync", C`using System.Net;
using System.Net.Http.Json;

var shelf = new Dictionary<int, string> { [1] = "Dune", [2] = "Emma" };
var http = new HttpClient(new FakeServer(async request =>
{
    int id = int.Parse(request.RequestUri!.Segments.Last());
    if (!shelf.ContainsKey(id)) return new HttpResponseMessage(HttpStatusCode.NotFound);
    if (request.Method == HttpMethod.Put) shelf[id] = (await request.Content!.ReadFromJsonAsync<Book>())!.Title;
    if (request.Method == HttpMethod.Delete) shelf.Remove(id);
    return new HttpResponseMessage(HttpStatusCode.NoContent);
}))
{
    BaseAddress = new Uri("https://library.example/")
};

Console.WriteLine((int)(await http.PutAsJsonAsync("books/2", new Book("Emma (2nd ed.)"))).StatusCode);
Console.WriteLine((int)(await http.DeleteAsync("books/1")).StatusCode);
Console.WriteLine((int)(await http.DeleteAsync("books/1")).StatusCode);
Console.WriteLine(string.Join(", ", shelf.Values));

record Book(string Title);` + FAKE_ASYNC),
      page("Pitfalls"),
      { h: "The JSON methods without their using — CS1061" },
      run("pit-using", "GetFromJsonAsync is an extension method in System.Net.Http.Json", C`var http = new HttpClient();
var numbers = await http.GetFromJsonAsync<int[]>("https://api.example/numbers");
Console.WriteLine(numbers!.Length);`),
      "Add `using System.Net.Http.Json;` at the top.",
      { h: "A base address without its trailing slash" },
      run("pit-base", "relative paths replace the base's last segment", C`foreach (var (baseUrl, path) in new[]
{
    ("https://api.example/v1/", "books"),
    ("https://api.example/v1", "books"),
    ("https://api.example/v1/", "/books")
})
{
    Console.WriteLine($"{baseUrl} + {path} = {new Uri(new Uri(baseUrl), path)}");
}`),
      "This is how `HttpClient` combines `BaseAddress` with a path: `v1` is dropped twice. End the base with `/`, start the path without one.",
      { h: "GetFromJsonAsync on a missing resource" },
      run("pit-404json", "it throws rather than reading the error body", C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.NotFound)
{
    Content = JsonContent.Create(new { error = "no such city" })
}));
try
{
    var f = await http.GetFromJsonAsync<Forecast>("https://weather.example/v1/forecast/atlantis");
    Console.WriteLine(f);
}
catch (HttpRequestException e)
{
    Console.WriteLine($"{(int?)e.StatusCode}: {e.Message}");
}

record Forecast(string City, double TempC);` + FAKE),
      "Use `GetAsync` and look at the status when a 404 is a normal answer (a search, a lookup).",
      page("Connections"),
      { ul: [ "**Back:** 11.2 JSON and records; T1.18 the exchange underneath.", "**Next:** T1.20 when the server is slow or failing; T1.21 the API's side; T2D calls an API from a desktop app.", "**Project:** the *Weather client* in Rider is this lesson against a real-shaped API, tested with a fake handler." ] },
      page("Good practice"),
      { ul: [ "One shared `HttpClient` with a `BaseAddress` ending in `/`.", "Records for the JSON you read; only the properties you use.", "Check the status before reading a body you will trust." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Weather lookup* and *Post the notes*." ] },
      page("Quick reference"),
      run("qr", "post, then read back", C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(async request =>
    new HttpResponseMessage(HttpStatusCode.Created) { Content = JsonContent.Create(await request.Content!.ReadFromJsonAsync<Pet>()) }));
var res = await http.PostAsJsonAsync("https://pets.example/pets", new Pet("Rex", 4));
Console.WriteLine($"{(int)res.StatusCode} {await res.Content.ReadFromJsonAsync<Pet>()}");

record Pet(string Name, int Age);` + FAKE_ASYNC),
      { ul: [ "`using System.Net.Http.Json;`", "`GetFromJsonAsync<T>(path)` · `PostAsJsonAsync(path, value)` · `content.ReadFromJsonAsync<T>()`", "`new HttpClient { BaseAddress = new Uri(\"https://host/v1/\") }` — one, shared." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1061", "no such method: the `using System.Net.Http.Json;` is missing", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: C`using System.Net.Http.Json;

var body = JsonContent.Create(new Pet("Rex", 4));
Console.WriteLine(await body.ReadAsStringAsync());

record Pet(string Name, int Age);`, why: "JsonContent uses the web defaults, so the names are written in camelCase.", concepts: ["http-json"] },
        { id: "p2", src: C`Console.WriteLine(new Uri(new Uri("https://api.example/v2/"), "users/7"));
Console.WriteLine(new Uri(new Uri("https://api.example/v2"), "users/7"));`, why: "Without the trailing slash, v2 is the last segment and is replaced.", concepts: ["httpclient"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the one call that gets and deserialises.", src: C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new { city = "Hull", tempC = 8.5 }) }));
var f = await http.@@<Forecast>("https://weather.example/v1/forecast/hull");
Console.WriteLine($"{f!.City} {f.TempC}");

record Forecast(string City, double TempC);` + FAKE, out: "Hull 8.5", answer: "GetFromJsonAsync", concepts: ["http-json"] }
      ],
      bug: [
        { id: "b1", q: "It should print the forecast, or not found.", src: C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(request => request.RequestUri!.AbsolutePath.EndsWith("leeds")
    ? new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new { city = "Leeds", tempC = 11.5 }) }
    : new HttpResponseMessage(HttpStatusCode.NotFound) { Content = JsonContent.Create(new { error = "no such city" }) }));
foreach (string city in new[] { "leeds", "atlantis" })
{
    var response = await http.GetAsync($"https://weather.example/v1/forecast/{city}");
    var f = await response.Content.ReadFromJsonAsync<Forecast>();
    Console.WriteLine($"{city}: {f!.TempC} °C");
}

record Forecast(string City, double TempC);` + FAKE, out: "leeds: 11.5 °C\natlantis: not found", fixedText: "prints atlantis: not found", why: "The 404's error body was read as a Forecast, so TempC is just 0. Check response.IsSuccessStatusCode (or the status) before reading the body.", concepts: ["http-json", "http-status"] }
      ]
    },
    flashcards: [
      ["Which using brings GetFromJsonAsync and PostAsJsonAsync?", "using System.Net.Http.Json;"],
      ["What does GetFromJsonAsync do for a 404?", "Throws HttpRequestException (it checks the status)."],
      ["Why make one HttpClient and share it?", "Each one holds network connections; one per request can run out of sockets."],
      ["BaseAddress https://x/v1 plus \"books\" gives…?", "https://x/books — the base needs its trailing slash."],
      ["What names do the HTTP JSON methods use by default?", "The web defaults: camelCase out, case-insensitive in."],
      ["What does a 201 Created usually carry?", "A Location header with the new resource's URL, and often the resource itself."]
    ],
    quiz: [
      { q: "A lookup where \"not found\" is a normal answer should use…", opts: ["GetFromJsonAsync in a try", "GetAsync, check the status, then ReadFromJsonAsync", "GetStringAsync", "a new HttpClient"], ans: 1, why: "You decide what a 404 means before reading." },
      { q: "The JSON has 12 properties; your record has 3. Deserialising…", opts: ["fails", "fills the 3 and ignores the rest", "needs all 12", "returns null"], ans: 1, why: "Unknown properties are ignored by default." },
      { q: "BaseAddress = https://api.example/v1/ and GetAsync(\"/books\") requests…", opts: ["https://api.example/v1/books", "https://api.example/books", "an error", "https://api.example/v1//books"], ans: 1, why: "A leading slash means \"from the host's root\"." }
    ]
  });
  var WEATHER_SERVER = C`
var forecasts = new Dictionary<string, Forecast>
{
    ["leeds"] = new("Leeds", 11.5, "rain"),
    ["york"] = new("York", 9, "cloud"),
    ["hull"] = new("Hull", 12, "wind")
};
var http = new HttpClient(new FakeServer(request =>
{
    string city = request.RequestUri!.Segments.Last();
    return forecasts.TryGetValue(city, out var f)
        ? new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(f) }
        : new HttpResponseMessage(HttpStatusCode.NotFound) { Content = JsonContent.Create(new { title = "no such city" }) };
}))
{
    BaseAddress = new Uri("https://weather.example/v1/")
};
`;
  var NOTES_SERVER = C`
var saved = new List<Note>();
var http = new HttpClient(new FakeServer(async request =>
{
    if (request.Method == HttpMethod.Get)
        return new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(saved) };
    var draft = await request.Content!.ReadFromJsonAsync<Draft>();
    if (string.IsNullOrWhiteSpace(draft?.Text))
        return new HttpResponseMessage(HttpStatusCode.BadRequest) { Content = JsonContent.Create(new Problem("text is required")) };
    var note = new Note(saved.Count + 1, draft.Text.Trim());
    saved.Add(note);
    var created = new HttpResponseMessage(HttpStatusCode.Created) { Content = JsonContent.Create(note) };
    created.Headers.Location = new Uri($"https://notes.example/notes/{note.Id}");
    return created;
}))
{
    BaseAddress = new Uri("https://notes.example/")
};
`;
  K.add({ tasks: {
    "T1.19-weather": { lesson: "T1.19", title: "Weather lookup", tier: "core", minutes: 15, concepts: ["http-json", "httpclient"],
      statement: ["Each line is a city name. The starter's fake server answers `forecast/NAME` (the name in lower case) with JSON `{\"city\":…,\"tempC\":…,\"summary\":…}`, or a 404 for a city it does not know.", "For each city print `City: T °C, summary` with the city as the JSON gives it, or `name: not found` with the name as typed. Then print `found F of N`."],
      starter: C`using System.Net;
using System.Net.Http.Json;
` + WEATHER_SERVER + C`
// read the cities and look each one up

record Forecast(string City, double TempC, string Summary);` + FAKE,
      examples: [{ stdin: "Leeds\natlantis\nHULL", out: "Leeds: 11.5 °C, rain\natlantis: not found\nHull: 12 °C, wind\nfound 2 of 3" }],
      hidden: [{ stdin: "york", out: "York: 9 °C, cloud\nfound 1 of 1" }, { stdin: "", out: "found 0 of 0" }],
      rules: [uses(/ReadFromJsonAsync|GetFromJsonAsync/, "Let HttpClient read the JSON: ReadFromJsonAsync or GetFromJsonAsync."), noUse(/JsonSerializer|JsonDocument|JsonNode/, "No hand-made JSON parsing: the HttpClient JSON methods do it.", "json")],
      hints: ["while ((line = Console.ReadLine()) is not null && line != \"\") { var response = await http.GetAsync($\"forecast/{line.ToLower()}\"); … }", "if (!response.IsSuccessStatusCode) { Console.WriteLine($\"{line}: not found\"); continue; }", "var f = await response.Content.ReadFromJsonAsync<Forecast>(); Console.WriteLine($\"{f!.City}: {f.TempC} °C, {f.Summary}\");"],
      answer: C`using System.Net;
using System.Net.Http.Json;
` + WEATHER_SERVER + C`
int asked = 0, found = 0;
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    asked++;
    var response = await http.GetAsync($"forecast/{line.ToLower()}");
    if (!response.IsSuccessStatusCode)
    {
        Console.WriteLine($"{line}: not found");
        continue;
    }
    var f = await response.Content.ReadFromJsonAsync<Forecast>();
    found++;
    Console.WriteLine($"{f!.City}: {f.TempC} °C, {f.Summary}");
}
Console.WriteLine($"found {found} of {asked}");

record Forecast(string City, double TempC, string Summary);` + FAKE },
    "T1.19-notes": { lesson: "T1.19", title: "Post the notes", tier: "stretch", minutes: 20, concepts: ["http-json", "http-status"],
      statement: ["Each line is the text of a note. POST each to `notes` as JSON `{\"text\":…}` (a `Draft`). The starter's server answers 201 Created with the saved note and its `Location`, or 400 with a `Problem` (`{\"title\":…}`) when the text is blank.", "For each note print `201 PATH` (the path of its Location) or `400 TITLE`. Then GET `notes` (a list of `Note`) and print `saved N: TEXT | TEXT …` (`saved 0` when there are none)."],
      starter: C`using System.Net;
using System.Net.Http.Json;
` + NOTES_SERVER + C`
record Draft(string Text);
record Note(int Id, string Text);
record Problem(string Title);` + FAKE_ASYNC,
      examples: [{ stdin: "buy milk\n   \nring Kai", out: "201 /notes/1\n400 text is required\n201 /notes/2\nsaved 2: buy milk | ring Kai" }],
      hidden: [{ stdin: "", out: "saved 0" }, { stdin: "one", out: "201 /notes/1\nsaved 1: one" }],
      rules: [uses(/PostAsJsonAsync\s*\(/, "Send each note with PostAsJsonAsync."), uses(/GetFromJsonAsync|ReadFromJsonAsync/, "Read the saved notes as JSON.", "read")],
      hints: ["var response = await http.PostAsJsonAsync(\"notes\", new Draft(line));", "if (response.StatusCode == HttpStatusCode.Created) Console.WriteLine($\"201 {response.Headers.Location!.AbsolutePath}\"); else { var p = await response.Content.ReadFromJsonAsync<Problem>(); … }", "var all = await http.GetFromJsonAsync<List<Note>>(\"notes\") ?? new();"],
      answer: C`using System.Net;
using System.Net.Http.Json;
` + NOTES_SERVER + C`
string? line;
while ((line = Console.ReadLine()) is not null)
{
    var response = await http.PostAsJsonAsync("notes", new Draft(line));
    if (response.StatusCode == HttpStatusCode.Created)
        Console.WriteLine($"201 {response.Headers.Location!.AbsolutePath}");
    else
    {
        var problem = await response.Content.ReadFromJsonAsync<Problem>();
        Console.WriteLine($"{(int)response.StatusCode} {problem!.Title}");
    }
}
var all = await http.GetFromJsonAsync<List<Note>>("notes") ?? new();
Console.WriteLine(all.Count == 0 ? "saved 0" : $"saved {all.Count}: {string.Join(" | ", all.Select(n => n.Text))}");

record Draft(string Text);
record Note(int Id, string Text);
record Problem(string Title);` + FAKE_ASYNC }
  } });

  /* ================================================================
     T1.20 Retries, timeouts and cancellation
     ================================================================ */
  lesson("T1.20", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "Real servers are slow, busy and sometimes down. A client that waits forever freezes; one that gives up at the first 503 fails for no reason; one that retries instantly and endlessly makes a busy server busier.",
        "Three tools fix it: a **timeout** (stop waiting), **cancellation** (stop when the user or the program says so) and **retries with backoff** (try again, later, a few times, only when it can help).",
        "This lesson's fake server takes time: its answer gets the request's `CancellationToken`, so a timeout really stops it."
      ] },
      page("Core idea"),
      run("timeout", "HttpClient.Timeout ends a request that takes too long", C`using System.Net;

var http = new HttpClient(new FakeServer(async (request, token) =>
{
    int ms = int.Parse(request.RequestUri!.Segments.Last());
    await Task.Delay(ms, token);
    return new HttpResponseMessage(HttpStatusCode.OK);
}))
{
    BaseAddress = new Uri("https://slow.example/"),
    Timeout = TimeSpan.FromMilliseconds(250)
};

foreach (string path in new[] { "delay/80", "delay/600", "delay/120" })
{
    try
    {
        var response = await http.GetAsync(path);
        Console.WriteLine($"{path}: {(int)response.StatusCode}");
    }
    catch (TaskCanceledException e) when (e.InnerException is TimeoutException)
    {
        Console.WriteLine($"{path}: timed out after {http.Timeout.TotalMilliseconds} ms");
    }
}` + FAKE_SLOW),
      { ul: [
        "`Timeout` covers each whole request; the default is 100 seconds, far too long for a user to wait.",
        "A timeout throws `TaskCanceledException` whose `InnerException` is a `TimeoutException` — that is how it differs from a cancellation you asked for.",
        "The client is free again at once: the 120 ms request after the slow one works."
      ] },
      run("token", "your own token: stop when the user says so", C`using System.Net;

var http = new HttpClient(new FakeServer(async (request, token) =>
{
    await Task.Delay(1000, token);
    return new HttpResponseMessage(HttpStatusCode.OK);
}));

using var user = new CancellationTokenSource();
user.CancelAfter(150);   // the user presses Cancel
try
{
    await http.GetAsync("https://big.example/video", user.Token);
    Console.WriteLine("downloaded");
}
catch (OperationCanceledException) when (user.IsCancellationRequested)
{
    Console.WriteLine("cancelled by the user");
}` + FAKE_SLOW),
      page("Rules"),
      { table: { head: ["Outcome", "Retry?", "Why"], rows: [
        ["408, 429, 500, 502, 503, 504", "yes, with backoff", "**transient**: busy, overloaded or restarting — it may work later"],
        ["`HttpRequestException` with no status", "yes, with backoff", "no answer at all: the connection dropped"],
        ["a timeout", "yes, if the request is idempotent", "it may only have been slow"],
        ["400, 401, 403, 404, 409, 422", "**no**", "the request itself is wrong; it will be wrong next time too"],
        ["your own cancellation", "**no**", "someone asked to stop"]
      ] } },
      { ul: [
        "**Backoff:** wait longer after each failure — 100 ms, 200, 400 (doubling, **exponential**) — and give up after a few attempts.",
        "**Retry-After:** a 429 or 503 may say how long to wait. Obey it.",
        "Only retry what is **idempotent** (GET, PUT, DELETE), or a POST the API lets you repeat safely (an idempotency key).",
        "Pass a `CancellationToken` all the way down: every `…Async` call takes one."
      ] },
      page("Variations"),
      { h: "Which failures are worth retrying" },
      run("transient", "one method decides", C`using System.Net;

foreach (int code in new[] { 200, 404, 408, 429, 500, 503, 400 })
    Console.WriteLine($"{code} {(HttpStatusCode)code}: {(IsTransient((HttpStatusCode)code) ? "retry" : "stop")}");

static bool IsTransient(HttpStatusCode code) =>
    code is HttpStatusCode.RequestTimeout or HttpStatusCode.TooManyRequests
    || (int)code >= 500;`),
      { h: "Retrying with backoff" },
      run("retry", "the server is busy twice, then answers", C`using System.Net;

int calls = 0;
var http = new HttpClient(new FakeServer((request, token) =>
{
    calls++;
    var code = calls < 3 ? HttpStatusCode.ServiceUnavailable : HttpStatusCode.OK;
    return Task.FromResult(new HttpResponseMessage(code));
}));

for (int attempt = 1; ; attempt++)
{
    var response = await http.GetAsync("https://busy.example/report");
    Console.WriteLine($"attempt {attempt}: {(int)response.StatusCode}");
    if (response.IsSuccessStatusCode || attempt == 4) break;
    int wait = 25 * (1 << (attempt - 1));
    Console.WriteLine($"  waiting {wait} ms");
    await Task.Delay(wait);
}` + FAKE_SLOW),
      { h: "The server says when" },
      run("retry-after", "429 Too Many Requests with Retry-After", C`using System.Net;
using System.Net.Http.Headers;

int calls = 0;
var http = new HttpClient(new FakeServer((request, token) =>
{
    if (++calls > 1) return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
    var busy = new HttpResponseMessage(HttpStatusCode.TooManyRequests);
    busy.Headers.RetryAfter = new RetryConditionHeaderValue(TimeSpan.FromSeconds(2));
    return Task.FromResult(busy);
}));

var first = await http.GetAsync("https://api.example/search?q=tea");
TimeSpan wait = first.Headers.RetryAfter?.Delta ?? TimeSpan.FromSeconds(1);
Console.WriteLine($"{(int)first.StatusCode}: asked to wait {wait.TotalSeconds} s");
await Task.Delay(20);   // the sandbox waits a fiftieth of a second instead
var second = await http.GetAsync("https://api.example/search?q=tea");
Console.WriteLine($"{(int)second.StatusCode}");` + FAKE_SLOW),
      { h: "Two reasons to stop: linked tokens" },
      run("linked", "whichever comes first: the user, or this request's deadline", C`using System.Net;

var http = new HttpClient(new FakeServer(async (request, token) =>
{
    await Task.Delay(int.Parse(request.RequestUri!.Segments.Last()), token);
    return new HttpResponseMessage(HttpStatusCode.OK);
}));
using var user = new CancellationTokenSource();
user.CancelAfter(400);

foreach (int ms in new[] { 100, 400, 300 })
{
    using var deadline = CancellationTokenSource.CreateLinkedTokenSource(user.Token);
    deadline.CancelAfter(200);
    try
    {
        await http.GetAsync($"https://api.example/wait/{ms}", deadline.Token);
        Console.WriteLine($"{ms} ms: ok");
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine($"{ms} ms: {(user.IsCancellationRequested ? "the user cancelled" : "too slow")}");
    }
}` + FAKE_SLOW),
      page("Pitfalls"),
      { h: "A number is not a TimeSpan — CS0029" },
      run("pit-timeout", "seconds? milliseconds? C# will not guess", C`var http = new HttpClient { Timeout = 5 };`),
      "`Timeout = TimeSpan.FromSeconds(5)` says which.",
      { h: "Trusting the default" },
      run("pit-default", "how long a plain HttpClient waits", C`var http = new HttpClient();
Console.WriteLine(http.Timeout);
Console.WriteLine(http.Timeout.TotalSeconds + " seconds");`),
      "A hundred seconds of a frozen button. Set a timeout the user can live with.",
      { h: "Retrying everything, at once, forever" },
      "Retrying a 404 never helps. Retrying instantly turns one overloaded server into a thousand clients hammering it. Retrying a POST can create the same order twice. Retry only transient failures, with growing waits, a few times.",
      page("Connections"),
      { ul: [ "**Back:** 11.7 cancellation tokens; 11.9 the downloader's limits and retries; T1.18 idempotent methods.", "**Next:** T1.21 the status codes an API chooses; T2D an app that cancels what is no longer wanted.", "**Your own app:** KurenaiOS's sync backs off and retries the same way." ] },
      page("Good practice"),
      { ul: [ "Every request has a deadline; every `…Async` call gets the token.", "Retry transient failures only, 3 or 4 times, with exponential backoff; obey Retry-After.", "Tell a timeout from a cancellation: the user does not want an error message for pressing Cancel." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Retry the busy server* and *Deadlines*." ] },
      page("Quick reference"),
      run("qr", "a retrying GET", C`using System.Net;

int calls = 0;
var http = new HttpClient(new FakeServer((request, token) =>
    Task.FromResult(new HttpResponseMessage(++calls == 1 ? HttpStatusCode.BadGateway : HttpStatusCode.OK))));
var response = await GetWithRetry(http, "https://api.example/x", 3);
Console.WriteLine($"{(int)response.StatusCode} after {calls} call(s)");

static async Task<HttpResponseMessage> GetWithRetry(HttpClient http, string url, int tries)
{
    for (int i = 1; ; i++)
    {
        var r = await http.GetAsync(url);
        if (r.IsSuccessStatusCode || (int)r.StatusCode < 500 || i == tries) return r;
        await Task.Delay(20 * i);
    }
}` + FAKE_SLOW),
      { ul: [ "`new HttpClient { Timeout = TimeSpan.FromSeconds(10) }`", "`using var cts = new CancellationTokenSource(ms); await http.GetAsync(url, cts.Token);`", "`CancellationTokenSource.CreateLinkedTokenSource(a, b)`: cancelled when either is." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "an int where a TimeSpan is wanted", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: C`using System.Net;

var http = new HttpClient(new FakeServer(async (request, token) =>
{
    await Task.Delay(int.Parse(request.RequestUri!.Segments.Last()), token);
    return new HttpResponseMessage(HttpStatusCode.OK);
})) { Timeout = TimeSpan.FromMilliseconds(200) };
foreach (int ms in new[] { 50, 400, 100 })
{
    try { await http.GetAsync($"https://x.example/{ms}"); Console.Write("ok "); }
    catch (TaskCanceledException) { Console.Write("cut "); }
}
Console.WriteLine();` + FAKE_SLOW, why: "Only the 400 ms request outlives the 200 ms timeout; the next one starts fresh.", concepts: ["http-timeouts"] },
        { id: "p2", src: C`for (int attempt = 1; attempt <= 4; attempt++)
    Console.Write(100 * (1 << (attempt - 1)) + " ");
Console.WriteLine();`, why: "Exponential backoff doubles each wait: 100, 200, 400, 800.", concepts: ["http-retries"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so only a timeout is caught here.", src: C`using System.Net;

var http = new HttpClient(new FakeServer(async (request, token) => { await Task.Delay(500, token); return new HttpResponseMessage(HttpStatusCode.OK); }))
{
    Timeout = TimeSpan.FromMilliseconds(100)
};
try { await http.GetAsync("https://x.example/"); }
catch (TaskCanceledException e) when (e.InnerException is @@) { Console.WriteLine("timed out"); }` + FAKE_SLOW, out: "timed out", answer: "TimeoutException", concepts: ["http-timeouts"] }
      ],
      bug: [
        { id: "b1", q: "It should try a 404 once and stop: `attempt 1: 404` then `not retried`.", src: C`using System.Net;

var http = new HttpClient(new FakeServer((request, token) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound))));
for (int attempt = 1; attempt <= 3; attempt++)
{
    var response = await http.GetAsync("https://api.example/books/9");
    Console.WriteLine($"attempt {attempt}: {(int)response.StatusCode}");
    if (response.IsSuccessStatusCode) break;
    await Task.Delay(10 * attempt);
}
Console.WriteLine("not retried");` + FAKE_SLOW, out: "attempt 1: 404\nnot retried", fixedText: "stops after one attempt", why: "It retries every failure. A 404 is not transient: break unless the code is 408, 429 or 5xx.", concepts: ["http-retries"] }
      ]
    },
    flashcards: [
      ["What is HttpClient's default timeout?", "100 seconds."],
      ["How do you tell a timeout from your own cancellation?", "A timeout's TaskCanceledException has a TimeoutException inside; your token's IsCancellationRequested is true when you cancelled."],
      ["Which status codes are worth retrying?", "Transient ones: 408, 429 and 5xx (500, 502, 503, 504)."],
      ["What is exponential backoff?", "Waiting longer after each failure, doubling: 100, 200, 400 ms…"],
      ["What does a Retry-After header say?", "How long to wait (or until when) before trying again; obey it."],
      ["Why not retry a POST automatically?", "It is not idempotent: the first may have worked, so a retry can do it twice."]
    ],
    quiz: [
      { q: "Retrying a 404 three times…", opts: ["usually works the third time", "never helps: the request is wrong", "is required by HTTP", "turns it into a 200"], ans: 1, why: "4xx means the request itself is wrong." },
      { q: "A linked token source made from the user's token, with CancelAfter(200), is cancelled when…", opts: ["only the user cancels", "only 200 ms pass", "either happens first", "both happen"], ans: 2, why: "Linked: cancelled when any source is." },
      { q: "Why wait longer after each failed attempt?", opts: ["to give a struggling server room to recover", "HTTP requires it", "to save memory", "it is faster overall"], ans: 0, why: "Instant retries from many clients make overload worse." }
    ]
  });
  var BUSY_SERVER = C`
var plan = new Dictionary<string, Queue<int>>();
var order = new List<string>();
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    string[] parts = line.Split(' ');
    plan[parts[0]] = new Queue<int>(parts[1].Split(',').Select(int.Parse));
    order.Add(parts[0]);
}
var http = new HttpClient(new FakeServer((request, token) =>
{
    var codes = plan[request.RequestUri!.AbsolutePath];
    int code = codes.Count > 1 ? codes.Dequeue() : codes.Peek();
    return Task.FromResult(new HttpResponseMessage((HttpStatusCode)code));
}))
{
    BaseAddress = new Uri("https://busy.example")
};
`;
  var SLOW_SERVER = C`
string[] first = (Console.ReadLine() ?? "").Split(' ');
int timeout = int.Parse(first[0]), budget = int.Parse(first[1]);
var pages = new List<(string Path, int Ms)>();
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    string[] parts = line.Split(' ');
    pages.Add((parts[0], int.Parse(parts[1])));
}
var http = new HttpClient(new FakeServer(async (request, token) =>
{
    await Task.Delay(pages.First(p => p.Path == request.RequestUri!.AbsolutePath).Ms, token);
    return new HttpResponseMessage(HttpStatusCode.OK);
}))
{
    BaseAddress = new Uri("https://slow.example")
};
`;
  K.add({ tasks: {
    "T1.20-retry": { lesson: "T1.20", title: "Retry the busy server", tier: "core", minutes: 20, concepts: ["http-retries"],
      statement: ["Each line is `PATH CODES`: the fake server answers successive GETs for PATH with those status codes in turn, then repeats the last one.", "GET each path with up to 3 attempts, retrying only the transient codes 408, 429 and 500–599, waiting 10 × attempt ms between attempts. Print `PATH: CODE after A attempt(s)` for the first code that is not retried, or `PATH: gave up after 3 attempts (CODE)`."],
      starter: C`using System.Net;
` + BUSY_SERVER + FAKE_SLOW,
      examples: [{ stdin: "/a 503,503,200\n/b 404\n/c 500,500,500,500\n/d 429,201", out: "/a: 200 after 3 attempt(s)\n/b: 404 after 1 attempt(s)\n/c: gave up after 3 attempts (500)\n/d: 201 after 2 attempt(s)" }],
      hidden: [{ stdin: "/x 502,408,204", out: "/x: 204 after 3 attempt(s)" }, { stdin: "/y 200\n/z 503,401", out: "/y: 200 after 1 attempt(s)\n/z: 401 after 2 attempt(s)" }],
      rules: [uses(/Task\.Delay\s*\(/, "Wait between attempts with Task.Delay."), uses(/GetAsync\s*\(/, "Send each attempt with GetAsync.", "get")],
      hints: ["static bool IsTransient(int code) => code is 408 or 429 || code >= 500;", "for (int attempt = 1; attempt <= 3; attempt++) { var response = await http.GetAsync(path); int code = (int)response.StatusCode; … }", "if (!IsTransient(code)) { print …; break; } if (attempt == 3) print gave up …; else await Task.Delay(10 * attempt);"],
      answer: C`using System.Net;
` + BUSY_SERVER + C`
foreach (string path in order)
{
    for (int attempt = 1; attempt <= 3; attempt++)
    {
        var response = await http.GetAsync(path);
        int code = (int)response.StatusCode;
        if (!IsTransient(code))
        {
            Console.WriteLine($"{path}: {code} after {attempt} attempt(s)");
            break;
        }
        if (attempt == 3) Console.WriteLine($"{path}: gave up after 3 attempts ({code})");
        else await Task.Delay(10 * attempt);
    }
}

static bool IsTransient(int code) => code is 408 or 429 || code >= 500;` + FAKE_SLOW },
    "T1.20-deadline": { lesson: "T1.20", title: "Deadlines", tier: "stretch", minutes: 25, concepts: ["http-timeouts"],
      statement: ["The first line is `TIMEOUT BUDGET` in ms; then lines `PATH MS`: the starter's fake server takes MS to answer PATH.", "GET the paths in order. Each request has its own TIMEOUT; the whole run has a BUDGET, counted from the start, shared by every request (link the two). Print `PATH: ok`, `PATH: timed out` (its own deadline), `PATH: cancelled` (the budget ran out during it) or `PATH: skipped` (the budget had already run out). Then `ok O, timed out T, cancelled C, skipped S`. No two deadlines fall within 100 ms of each other."],
      starter: C`using System.Net;
` + SLOW_SERVER + FAKE_SLOW,
      examples: [{ stdin: "300 600\n/a 50\n/b 400\n/c 100\n/d 500\n/e 10", out: "/a: ok\n/b: timed out\n/c: ok\n/d: cancelled\n/e: skipped\nok 2, timed out 1, cancelled 1, skipped 1" }],
      hidden: [{ stdin: "200 5000\n/x 50\n/y 500", out: "/x: ok\n/y: timed out\nok 1, timed out 1, cancelled 0, skipped 0" }, { stdin: "1000 150\n/z 400\n/w 10", out: "/z: cancelled\n/w: skipped\nok 0, timed out 0, cancelled 1, skipped 1" }],
      rules: [uses(/CreateLinkedTokenSource\s*\(/, "Link each request's deadline to the run's budget."), uses(/catch\s*\(\s*(OperationCanceledException|TaskCanceledException)/, "Catch the cancellation.", "catch")],
      hints: ["using var run = new CancellationTokenSource(budget); — made before the first request.", "using var deadline = CancellationTokenSource.CreateLinkedTokenSource(run.Token); deadline.CancelAfter(timeout);", "if (run.IsCancellationRequested) → skipped (before) or cancelled (in the catch); otherwise the catch means timed out."],
      answer: C`using System.Net;
` + SLOW_SERVER + C`
using var run = new CancellationTokenSource(budget);
int ok = 0, timedOut = 0, cancelled = 0, skipped = 0;
foreach (var (path, _) in pages)
{
    if (run.IsCancellationRequested)
    {
        skipped++;
        Console.WriteLine($"{path}: skipped");
        continue;
    }
    using var deadline = CancellationTokenSource.CreateLinkedTokenSource(run.Token);
    deadline.CancelAfter(timeout);
    try
    {
        await http.GetAsync(path, deadline.Token);
        ok++;
        Console.WriteLine($"{path}: ok");
    }
    catch (OperationCanceledException)
    {
        if (run.IsCancellationRequested) { cancelled++; Console.WriteLine($"{path}: cancelled"); }
        else { timedOut++; Console.WriteLine($"{path}: timed out"); }
    }
}
Console.WriteLine($"ok {ok}, timed out {timedOut}, cancelled {cancelled}, skipped {skipped}");` + FAKE_SLOW }
  } });

  /* ================================================================
     T1.21 REST design
     ================================================================ */
  lesson("T1.21", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "So far you called APIs someone else designed. A good one can be guessed: once you have seen `GET /books/42`, you know what `DELETE /books/42` does.",
        "**REST** is that style: the URL names a **resource** (a noun), the method says what to do with it, and the status code says how it went.",
        "This lesson writes the server side too — the fake server becomes a small API — so you see both ends of each rule."
      ] },
      page("Core idea"),
      run("api", "a library API: one resource, five operations", C`using System.Net;
using System.Net.Http.Json;

var books = new Dictionary<int, Book> { [1] = new(1, "Dune"), [2] = new(2, "Emma") };
int nextId = 3;

var http = new HttpClient(new FakeServer(async request =>
{
    string[] parts = request.RequestUri!.AbsolutePath.Trim('/').Split('/');
    string method = request.Method.Method;
    if (parts[0] != "books" || parts.Length > 2) return new HttpResponseMessage(HttpStatusCode.NotFound);
    if (parts.Length == 1)
    {
        if (method == "GET") return Json(HttpStatusCode.OK, books.Values);
        if (method != "POST") return new HttpResponseMessage(HttpStatusCode.MethodNotAllowed);
        var draft = await request.Content!.ReadFromJsonAsync<Draft>();
        var book = new Book(nextId++, draft!.Title);
        books[book.Id] = book;
        var created = Json(HttpStatusCode.Created, book);
        created.Headers.Location = new Uri($"/books/{book.Id}", UriKind.Relative);
        return created;
    }
    if (!int.TryParse(parts[1], out int id)) return new HttpResponseMessage(HttpStatusCode.BadRequest);
    if (!books.ContainsKey(id)) return new HttpResponseMessage(HttpStatusCode.NotFound);
    if (method == "GET") return Json(HttpStatusCode.OK, books[id]);
    if (method != "DELETE") return new HttpResponseMessage(HttpStatusCode.MethodNotAllowed);
    books.Remove(id);
    return new HttpResponseMessage(HttpStatusCode.NoContent);
}))
{
    BaseAddress = new Uri("https://library.example/")
};

await Show(HttpMethod.Get, "books");
await Show(HttpMethod.Get, "books/2");
await Show(HttpMethod.Post, "books", new Draft("Kim"));
await Show(HttpMethod.Delete, "books/1");
await Show(HttpMethod.Get, "books/1");
await Show(HttpMethod.Get, "books/one");

async Task Show(HttpMethod method, string path, object? body = null)
{
    var request = new HttpRequestMessage(method, path);
    if (body is not null) request.Content = JsonContent.Create(body);
    var response = await http.SendAsync(request);
    string text = await response.Content.ReadAsStringAsync();
    Console.WriteLine($"{method} /{path} -> {(int)response.StatusCode} {text}".TrimEnd());
}

static HttpResponseMessage Json<T>(HttpStatusCode code, T body) => new(code) { Content = JsonContent.Create(body) };

record Book(int Id, string Title);
record Draft(string Title);` + FAKE_ASYNC),
      { ul: [
        "`/books` is the **collection**, `/books/2` one **item** in it. The method is the verb: nothing in the URL says get, create or delete.",
        "Each outcome has its own code: 200 with the data, 201 with the new item and its `Location`, 204 for done-with-nothing-to-say, 404 for no such item, 400 for an id that is not even a number.",
        "A client that knows these conventions needs almost no documentation."
      ] },
      page("Rules"),
      { table: { head: ["Request", "Means", "Success", "Usual failures"], rows: [
        ["`GET /books`", "list (filter and page with `?…`)", "200 + a list", "400 bad query"],
        ["`POST /books`", "create one", "201 + `Location` + the item", "400 / 422 invalid, 409 duplicate"],
        ["`GET /books/7`", "read one", "200 + the item", "404"],
        ["`PUT /books/7`", "replace it", "200 or 204", "400, 404"],
        ["`PATCH /books/7`", "change part of it", "200 or 204", "400, 404"],
        ["`DELETE /books/7`", "remove it", "204", "404"],
        ["`GET /books/7/loans`", "a sub-collection", "200 + a list", "404 (no book 7)"]
      ] } },
      { ul: [
        "**Nouns, plural, lower case:** `/books`, `/members/3/loans` — never `/getBooks` or `/books/7/delete`.",
        "A wrong **method** on a real resource is 405 Method Not Allowed; a wrong **path** is 404.",
        "Errors carry a body that says what went wrong: **problem details** (`application/problem+json`: `type`, `title`, `status`, `detail`).",
        "Version the API when you must break it: `/v2/books`. Never change what `/v1` means."
      ] },
      page("Variations"),
      { h: "Verbs hiding in URLs" },
      run("nouns", "a quick check of an API's routes", C`string[] routes =
{
    "GET /books", "POST /createBook", "GET /books/7/loans",
    "POST /books/7/delete", "DELETE /books/7", "GET /getAllMembers"
};
string[] verbs = { "get", "create", "delete", "update", "add", "remove" };
foreach (string route in routes)
{
    string path = route.Split(' ')[1];
    bool verb = path.Split('/').Any(part => verbs.Any(v => part.StartsWith(v, StringComparison.OrdinalIgnoreCase)));
    Console.WriteLine($"{route,-22} {(verb ? "a verb in the URL" : "ok")}");
}`),
      { h: "Paging with the query string" },
      run("paging", "each page links to the next", C`using System.Net;
using System.Net.Http.Json;

string[] titles = { "Dune", "Emma", "Kim", "Ulysses", "Beloved" };
var http = new HttpClient(new FakeServer(request =>
{
    var query = request.RequestUri!.Query.TrimStart('?').Split('&')
        .Select(pair => pair.Split('=')).ToDictionary(kv => kv[0], kv => int.Parse(kv[1]));
    int page = query["page"], size = query["size"];
    var items = titles.Skip((page - 1) * size).Take(size).ToList();
    string? next = page * size < titles.Length ? $"/books?page={page + 1}&size={size}" : null;
    return new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new Page(items, next)) };
}))
{
    BaseAddress = new Uri("https://library.example/")
};

string? url = "/books?page=1&size=2";
while (url is not null)
{
    var page = await http.GetFromJsonAsync<Page>(url);
    Console.WriteLine($"{url} -> {string.Join(", ", page!.Items)}");
    url = page.Next;
}

record Page(List<string> Items, string? Next);` + FAKE),
      { h: "Errors with a body: problem details" },
      run("problem", "the 400 says exactly what was wrong", C`using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(async request =>
{
    var draft = await request.Content!.ReadFromJsonAsync<Draft>();
    if (draft!.Title.Length > 0 && draft.Year <= 2026)
        return new HttpResponseMessage(HttpStatusCode.Created);
    var problem = new Problem("https://library.example/errors/invalid", "The book is not valid", 400,
        draft.Title.Length == 0 ? "Title is required." : $"Year {draft.Year} is in the future.");
    return new HttpResponseMessage(HttpStatusCode.BadRequest)
    {
        Content = JsonContent.Create(problem, mediaType: new MediaTypeHeaderValue("application/problem+json"))
    };
}));

foreach (var draft in new[] { new Draft("Kim", 1901), new Draft("", 2001), new Draft("Later", 2099) })
{
    var response = await http.PostAsJsonAsync("https://library.example/books", draft);
    if (response.IsSuccessStatusCode) { Console.WriteLine($"{draft.Title}: created"); continue; }
    var p = await response.Content.ReadFromJsonAsync<Problem>();
    Console.WriteLine($"{(int)response.StatusCode} {response.Content.Headers.ContentType!.MediaType}: {p!.Title} — {p.Detail}");
}

record Draft(string Title, int Year);
record Problem(string Type, string Title, int Status, string Detail);` + FAKE_ASYNC),
      { h: "PUT is idempotent, POST is not" },
      run("idempotent", "the same request twice", C`using System.Net;
using System.Net.Http.Json;

var settings = new Dictionary<string, string>();
var notes = new List<string>();
var http = new HttpClient(new FakeServer(async request =>
{
    string text = (await request.Content!.ReadFromJsonAsync<string>())!;
    if (request.Method == HttpMethod.Put) settings[request.RequestUri!.Segments.Last()] = text;
    else notes.Add(text);
    return new HttpResponseMessage(request.Method == HttpMethod.Put ? HttpStatusCode.NoContent : HttpStatusCode.Created);
}));

for (int i = 0; i < 2; i++)
{
    await http.PutAsJsonAsync("https://api.example/settings/theme", "dark");
    await http.PostAsJsonAsync("https://api.example/notes", "buy milk");
}
Console.WriteLine($"settings: {settings.Count} ({settings["theme"]})");
Console.WriteLine($"notes: {notes.Count}");` + FAKE_ASYNC),
      page("Pitfalls"),
      { h: "A status from a number — CS1503" },
      run("pit-201", "the constructor takes an HttpStatusCode", C`var response = new HttpResponseMessage(201);
Console.WriteLine(response.StatusCode);`),
      "`new HttpResponseMessage(HttpStatusCode.Created)` — and the reader of your code sees the word.",
      { h: "200 with an error inside" },
      run("pit-200", "every client now has to read the body to find out it failed", C`using System.Net;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(request => new HttpResponseMessage(HttpStatusCode.OK)
{
    Content = JsonContent.Create(new { ok = false, error = "no such book" })
}));
var response = await http.GetAsync("https://library.example/books/99");
Console.WriteLine($"success? {response.IsSuccessStatusCode}");
Console.WriteLine(await response.Content.ReadAsStringAsync());` + FAKE),
      "Retry logic, caches, monitoring and `EnsureSuccessStatusCode` all believe the 200. Say 404.",
      { h: "Everything on POST" },
      "`POST /api` with `{\"action\":\"deleteBook\",\"id\":7}` is a remote procedure call wearing HTTP. It cannot be cached, retried safely or guessed. Give each thing a URL and use the method that fits.",
      page("Connections"),
      { ul: [ "**Back:** T1.18 methods and status codes; T1.19 JSON bodies; T1.7 resources often match tables.", "**Next:** T1.22 who may call it; T1F builds a REST API with ASP.NET Core minimal APIs.", "**AQA:** 4.9.4.10 the client–server model, and REST using HTTP and JSON." ] },
      page("Good practice"),
      { ul: [ "Plural nouns for collections; the method is the verb.", "The right status every time, with a problem-details body for errors.", "Page large lists and link to the next page; never return ten thousand rows." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Route the library* and *Follow the pages*." ] },
      page("Quick reference"),
      run("qr", "the conventional codes, as a table", C`foreach (var (method, path) in new[] { ("GET", "/books"), ("POST", "/books"), ("GET", "/books/7"), ("PUT", "/books/7"), ("DELETE", "/books/7"), ("PATCH", "/books") })
    Console.WriteLine($"{method,-6} {path,-9} {Status(method, path)}");

static int Status(string method, string path) => (method, path.Count(c => c == '/')) switch
{
    ("GET", _) => 200,
    ("POST", 1) => 201,
    ("PUT" or "DELETE", 2) => 204,
    _ => 405
};`),
      { ul: [ "`/things` (collection) and `/things/{id}` (item); the method is the verb.", "200 data · 201 + Location · 204 nothing · 400/422 invalid · 404 missing · 405 wrong method · 409 conflict.", "Errors: `application/problem+json` with `title`, `status`, `detail`." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS1503", "an int where an HttpStatusCode is wanted", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: C`foreach (string path in new[] { "/members/3/loans", "/getMember/3", "/members/3" })
{
    string[] parts = path.Trim('/').Split('/');
    Console.WriteLine(parts.Length % 2 == 0 ? "item" : "collection");
}`, why: "In a REST path, names and ids alternate: an even number of parts ends on an id.", concepts: ["rest-design"] },
        { id: "p2", src: C`var log = new List<string>();
for (int i = 0; i < 3; i++) { log.Add("PUT theme=dark"); log.Add("POST note"); }
var state = new HashSet<string>();
int notes = 0;
foreach (string op in log) { if (op.StartsWith("PUT")) state.Add(op); else notes++; }
Console.WriteLine($"{state.Count} {notes}");`, why: "Repeating the PUT changes nothing more; each POST adds another note.", concepts: ["rest-design"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap with the status a successful create returns.", src: C`using System.Net;

var response = new HttpResponseMessage(HttpStatusCode.@@);
Console.WriteLine((int)response.StatusCode);`, out: "201", answer: "Created", concepts: ["rest-design"] }
      ],
      bug: [
        { id: "b1", q: "Deleting a book that does not exist should answer 404.", src: C`using System.Net;

var books = new HashSet<int> { 1, 2 };
var http = new HttpClient(new FakeServer(request =>
{
    int id = int.Parse(request.RequestUri!.Segments.Last());
    books.Remove(id);
    return new HttpResponseMessage(HttpStatusCode.NoContent);
}));
foreach (int id in new[] { 2, 9 })
    Console.WriteLine($"DELETE /books/{id} -> {(int)(await http.DeleteAsync($"https://library.example/books/{id}")).StatusCode}");` + FAKE, out: "DELETE /books/2 -> 204\nDELETE /books/9 -> 404", fixedText: "answers 404 for book 9", why: "HashSet.Remove returns false when there was nothing to remove: answer NotFound then.", concepts: ["rest-design"] }
      ]
    },
    flashcards: [
      ["In REST, what does the URL name, and what does the method say?", "The URL names a resource (a noun); the method says what to do with it."],
      ["What should POST /books return on success?", "201 Created, a Location header for the new book, usually the book itself."],
      ["404 or 405?", "404: no such resource (path). 405: the resource exists but not that method."],
      ["What is problem details?", "A standard error body (application/problem+json): type, title, status, detail."],
      ["Why page a list?", "So no single response returns thousands of rows; each page links to the next."],
      ["How do you change an API without breaking its clients?", "Add, never change; for a breaking change publish a new version (/v2)."]
    ],
    quiz: [
      { q: "Which is a RESTful way to delete loan 5 of member 3?", opts: ["POST /deleteLoan?id=5", "DELETE /members/3/loans/5", "GET /members/3/loans/5/delete", "POST /api {\"op\":\"delete\"}"], ans: 1, why: "A resource path and the DELETE method." },
      { q: "A client sends a book with no title. The best answer is…", opts: ["200 with {\"error\":…}", "500", "400 (or 422) with a problem-details body", "404"], ans: 2, why: "The client's input is invalid, and the body says why." },
      { q: "PUT /settings/theme sent twice…", opts: ["creates two settings", "leaves the same state as once", "is an error", "must be a POST"], ans: 1, why: "PUT replaces: it is idempotent." }
    ]
  });
  var LIBRARY_CLIENT = C`using System.Net;
using System.Net.Http.Json;

var titles = (Console.ReadLine() ?? "").Split('|', StringSplitOptions.RemoveEmptyEntries).ToList();
var http = new HttpClient(new Library(titles)) { BaseAddress = new Uri("https://library.example/") };
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    string[] parts = line.Split(' ', 3);
    var request = new HttpRequestMessage(new HttpMethod(parts[0]), parts[1].TrimStart('/'));
    if (parts.Length == 3) request.Content = JsonContent.Create(new Draft(parts[2]));
    var response = await http.SendAsync(request);
    string body = await response.Content.ReadAsStringAsync();
    Console.WriteLine($"{parts[0]} {parts[1]} -> {(int)response.StatusCode} {body}".TrimEnd());
}

record Book(int Id, string Title);
record Draft(string Title);
`;
  var PAGES_SERVER = C`
int size = int.Parse(Console.ReadLine() ?? "2");
var titles = new List<string>();
string? line;
while ((line = Console.ReadLine()) is not null && line != "") titles.Add(line);
var http = new HttpClient(new FakeServer(request =>
{
    var query = request.RequestUri!.Query.TrimStart('?').Split('&')
        .Select(pair => pair.Split('=')).ToDictionary(kv => kv[0], kv => int.Parse(kv[1]));
    int page = query["page"], per = query["size"];
    var items = titles.Skip((page - 1) * per).Take(per).ToList();
    string? next = page * per < titles.Count ? $"/titles?page={page + 1}&size={per}" : null;
    return new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new Page(items, next)) };
}))
{
    BaseAddress = new Uri("https://library.example/")
};
`;
  K.add({ tasks: {
    "T1.21-route": { lesson: "T1.21", title: "Route the library", tier: "core", minutes: 25, concepts: ["rest-design"],
      statement: ["Write the server: `class Library : HttpMessageHandler` holds books numbered from 1 (the first input line, titles split by `|`). The starter's client sends each line `METHOD PATH [TITLE]` to it and prints the status and body.", "`GET /books` → 200 and every book; `POST /books` → 201 and the new book (the next id); `GET /books/ID` → 200 and the book; `PUT /books/ID` → 204 (the title replaced); `DELETE /books/ID` → 204. A missing book → 404; an ID that is not a number → 400; another method on either path → 405; any other path → 404. Bodies are JSON from `JsonContent.Create` of a `Book`, or of the list in id order."],
      starter: LIBRARY_CLIENT + C`
class Library(List<string> titles) : HttpMessageHandler
{
    private readonly List<string> titles = titles;

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        => Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotImplemented));
}`,
      examples: [{ stdin: "Dune|Emma\nGET /books\nGET /books/2\nPOST /books Kim\nDELETE /books/1\nGET /books/1\nGET /books/x\nPATCH /books\nGET /authors", out: "GET /books -> 200 [{\"id\":1,\"title\":\"Dune\"},{\"id\":2,\"title\":\"Emma\"}]\nGET /books/2 -> 200 {\"id\":2,\"title\":\"Emma\"}\nPOST /books -> 201 {\"id\":3,\"title\":\"Kim\"}\nDELETE /books/1 -> 204\nGET /books/1 -> 404\nGET /books/x -> 400\nPATCH /books -> 405\nGET /authors -> 404" }],
      hidden: [{ stdin: "Kim\nPUT /books/1 Kim (new ed.)\nGET /books\nPUT /books/5 Gone\nDELETE /books\nPOST /books/1 Again", out: "PUT /books/1 -> 204\nGET /books -> 200 [{\"id\":1,\"title\":\"Kim (new ed.)\"}]\nPUT /books/5 -> 404\nDELETE /books -> 405\nPOST /books/1 -> 405" }, { stdin: "\nGET /books\nPOST /books First\nGET /books/1/loans", out: "GET /books -> 200 []\nPOST /books -> 201 {\"id\":1,\"title\":\"First\"}\nGET /books/1/loans -> 404" }],
      rules: [uses(/class\s+Library[^{]*HttpMessageHandler/, "Library is the HttpMessageHandler."), uses(/MethodNotAllowed|405/, "Answer 405 for a method a path does not support.", "405")],
      hints: ["Keep a SortedDictionary<int, Book> built from the titles, and the next id.", "string[] parts = request.RequestUri!.AbsolutePath.Trim('/').Split('/'); — 1 part is the collection, 2 an item; anything else (or not \"books\") is 404.", "Make SendAsync async to read a body: var draft = await request.Content!.ReadFromJsonAsync<Draft>(); then Json(HttpStatusCode.Created, book)."],
      answer: LIBRARY_CLIENT + C`
class Library : HttpMessageHandler
{
    private readonly SortedDictionary<int, Book> books = new();
    private int nextId = 1;

    public Library(List<string> titles)
    {
        foreach (string t in titles) { books[nextId] = new Book(nextId, t); nextId++; }
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
    {
        string[] parts = request.RequestUri!.AbsolutePath.Trim('/').Split('/');
        string method = request.Method.Method;
        if (parts[0] != "books" || parts.Length > 2) return new HttpResponseMessage(HttpStatusCode.NotFound);
        if (parts.Length == 1)
        {
            if (method == "GET") return Json(HttpStatusCode.OK, books.Values.ToList());
            if (method != "POST") return new HttpResponseMessage(HttpStatusCode.MethodNotAllowed);
            var draft = await request.Content!.ReadFromJsonAsync<Draft>(token);
            var book = new Book(nextId++, draft!.Title);
            books[book.Id] = book;
            return Json(HttpStatusCode.Created, book);
        }
        if (!int.TryParse(parts[1], out int id)) return new HttpResponseMessage(HttpStatusCode.BadRequest);
        if (method is not ("GET" or "PUT" or "DELETE")) return new HttpResponseMessage(HttpStatusCode.MethodNotAllowed);
        if (!books.ContainsKey(id)) return new HttpResponseMessage(HttpStatusCode.NotFound);
        if (method == "GET") return Json(HttpStatusCode.OK, books[id]);
        if (method == "PUT")
        {
            var draft = await request.Content!.ReadFromJsonAsync<Draft>(token);
            books[id] = new Book(id, draft!.Title);
        }
        else books.Remove(id);
        return new HttpResponseMessage(HttpStatusCode.NoContent);
    }

    private static HttpResponseMessage Json<T>(HttpStatusCode code, T body) => new(code) { Content = JsonContent.Create(body) };
}` },
    "T1.21-pages": { lesson: "T1.21", title: "Follow the pages", tier: "stretch", minutes: 15, concepts: ["rest-design", "http-json"],
      statement: ["The first line is a page size; the lines after it are titles. The starter's server answers `GET /titles?page=P&size=S` with `{\"items\":[…],\"next\":…}`, where `next` is the URL of the following page, or null on the last.", "Start at `/titles?page=1&size=SIZE` and follow `next` until it is null. Print every title numbered from 1 (`1. Dune`), then `N titles in R request(s)`."],
      starter: C`using System.Net;
using System.Net.Http.Json;
` + PAGES_SERVER + C`
record Page(List<string> Items, string? Next);` + FAKE,
      examples: [{ stdin: "2\nDune\nEmma\nKim\nUlysses\nBeloved", out: "1. Dune\n2. Emma\n3. Kim\n4. Ulysses\n5. Beloved\n5 titles in 3 request(s)" }],
      hidden: [{ stdin: "3\nA\nB\nC", out: "1. A\n2. B\n3. C\n3 titles in 1 request(s)" }, { stdin: "4", out: "0 titles in 1 request(s)" }],
      rules: [uses(/\.Next\b/, "Follow the page's next link."), noUse(/page\s*\+\+|page\s*\+=\s*1|page\s*=\s*page\s*\+/, "Do not count pages yourself: follow the links the server gives.", "links")],
      hints: ["string? url = $\"/titles?page=1&size={size}\";", "while (url is not null) { var page = await http.GetFromJsonAsync<Page>(url); requests++; … url = page!.Next; }", "foreach (string t in page.Items) Console.WriteLine($\"{++n}. {t}\");"],
      answer: C`using System.Net;
using System.Net.Http.Json;
` + PAGES_SERVER + C`
string? url = $"/titles?page=1&size={size}";
int n = 0, requests = 0;
while (url is not null)
{
    var page = await http.GetFromJsonAsync<Page>(url);
    requests++;
    foreach (string t in page!.Items) Console.WriteLine($"{++n}. {t}");
    url = page.Next;
}
Console.WriteLine($"{n} titles in {requests} request(s)");

record Page(List<string> Items, string? Next);` + FAKE }
  } });

  /* ================================================================
     T1.22 Authentication: API keys, OAuth and JWT
     ================================================================ */
  lesson("T1.22", {
    notes: [
      page("The problem it solves"),
      { ul: [
        "An API that anyone can call is fine for a public timetable; not for your notes, or a weather service that bills per call. The server must know **who** is calling (**authentication**) and **what** they may do (**authorisation**).",
        "The client proves it with something in a header: an **API key** (one secret for a program) or a **token** (a short-lived pass, often a **JWT**, obtained by logging in through **OAuth**).",
        "And the secret itself must never be in the code: code ends up in Git, and Git ends up public."
      ] },
      page("Core idea"),
      run("key", "an API key in a header; no key, no data", C`using System.Net;

var http = new HttpClient(new FakeServer(request =>
    request.Headers.TryGetValues("X-Api-Key", out var keys) && keys.First() == "k-demo"
        ? new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("12 °C") }
        : new HttpResponseMessage(HttpStatusCode.Unauthorized)))
{
    BaseAddress = new Uri("https://weather.example/")
};

Console.WriteLine($"no key: {(int)(await http.GetAsync("now")).StatusCode}");

// a public demo key here; a real one comes from the environment or user secrets
string key = Environment.GetEnvironmentVariable("WEATHER_KEY") ?? "k-demo";
http.DefaultRequestHeaders.Add("X-Api-Key", key);
var response = await http.GetAsync("now");
Console.WriteLine($"with key: {(int)response.StatusCode} {await response.Content.ReadAsStringAsync()}");` + FAKE),
      { ul: [
        "`DefaultRequestHeaders` go on every request this client sends.",
        "401 Unauthorized really means **unauthenticated**: no credentials, or bad ones.",
        "The key is read from an **environment variable** at run time, so the source code never contains it."
      ] },
      run("bearer", "a bearer token, and the difference between 401 and 403", C`using System.Net;
using System.Net.Http.Headers;

var scopes = new Dictionary<string, string[]> { ["t-reader"] = new[] { "read" }, ["t-admin"] = new[] { "read", "write" } };
var http = new HttpClient(new FakeServer(request =>
{
    var auth = request.Headers.Authorization;
    if (auth is not { Scheme: "Bearer", Parameter: not null } || !scopes.TryGetValue(auth.Parameter, out var can))
    {
        var denied = new HttpResponseMessage(HttpStatusCode.Unauthorized);
        denied.Headers.WwwAuthenticate.Add(new AuthenticationHeaderValue("Bearer"));
        return denied;
    }
    string need = request.Method == HttpMethod.Get ? "read" : "write";
    return new HttpResponseMessage(can.Contains(need) ? HttpStatusCode.OK : HttpStatusCode.Forbidden);
}));

foreach (var (token, method) in new[] { ((string?)null, HttpMethod.Get), ("t-wrong", HttpMethod.Get), ("t-reader", HttpMethod.Get), ("t-reader", HttpMethod.Delete), ("t-admin", HttpMethod.Delete) })
{
    var request = new HttpRequestMessage(method, "https://api.example/notes/4");
    if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    var response = await http.SendAsync(request);
    Console.WriteLine($"{token ?? "(none)",-9} {method,-6} -> {(int)response.StatusCode} {response.ReasonPhrase}");
}` + FAKE),
      { ul: [
        "`Authorization: Bearer <token>`: whoever **bears** the token is let in, so it must be kept as secret as a password.",
        "**401**: who are you? (no token, or not a valid one — the `WWW-Authenticate` header says how to log in). **403**: I know who you are, and you may not.",
        "A token carries **scopes**: what its holder may do. Ask for the least you need."
      ] },
      page("Rules"),
      { table: { head: ["Scheme", "Header", "Who uses it", "Note"], rows: [
        ["API key", "`X-Api-Key: …` (or the API's own name)", "a program calling a service", "one long-lived secret; easy to leak, so rotate it"],
        ["Bearer token", "`Authorization: Bearer …`", "apps acting for a user", "short-lived; refreshed through OAuth"],
        ["Basic", "`Authorization: Basic base64(user:password)`", "old or internal tools", "the password on every request; HTTPS only"]
      ] } },
      { ul: [
        "**OAuth 2** gets a token without the app ever seeing the user's password: the user logs in at the provider (the *authorization code* flow, with PKCE for apps), or a server uses its own client id and secret (*client credentials*).",
        "A **JWT** is three base64url parts, `header.payload.signature`. The payload holds **claims**: `sub` (who), `scope`, `exp` (expiry, Unix seconds). Anyone can read them; only the issuer's key can make a valid signature.",
        "**Secrets:** never in the code, never in Git, never in a URL. Use environment variables, `dotnet user-secrets` in development, a secret store in production.",
        "Always HTTPS: a token sent over plain HTTP can be read on the way."
      ] },
      sh("development secrets, outside the project folder", "dotnet user-secrets init\ndotnet user-secrets set \"Weather:ApiKey\" \"k-…\"\nexport WEATHER_KEY=k-…   # or an environment variable"),
      page("Variations"),
      { h: "Inside a JWT" },
      run("jwt", "make one, then read its claims back", C`using System.Text;
using System.Text.Json;

string token = Encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}") + "." + Encode("{\"sub\":\"kai\",\"scope\":\"notes.read notes.write\",\"exp\":1793000000}") + ".c2lnbmF0dXJl";
Console.WriteLine(token);

string[] parts = token.Split('.');
using var payload = JsonDocument.Parse(Decode(parts[1]));
var claims = payload.RootElement;
Console.WriteLine($"{parts.Length} parts; sub {claims.GetProperty("sub").GetString()}");
Console.WriteLine("scopes: " + string.Join(", ", claims.GetProperty("scope").GetString()!.Split(' ')));

static string Encode(string json) =>
    Convert.ToBase64String(Encoding.UTF8.GetBytes(json)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

static string Decode(string part)
{
    string b64 = part.Replace('-', '+').Replace('_', '/');
    b64 += new string('=', (4 - b64.Length % 4) % 4);
    return Encoding.UTF8.GetString(Convert.FromBase64String(b64));
}`),
      "Anyone can write that token — this listing just did. Reading claims is fine on the client; the **server** must verify the signature with its key before it believes any of them.",
      { h: "Expired or not" },
      run("exp", "exp is seconds since 1 January 1970, UTC", C`long exp = 1793000000;
DateTimeOffset expires = DateTimeOffset.FromUnixTimeSeconds(exp);
Console.WriteLine($"expires {expires:yyyy-MM-dd HH:mm} UTC");

foreach (long now in new[] { 1792996400L, 1793003600L })
{
    long left = exp - now;
    Console.WriteLine(left > 0 ? $"valid for {left / 60} more minutes" : $"expired {-left / 60} minutes ago");
}`),
      { h: "OAuth client credentials: a token for a secret" },
      run("oauth", "POST /token, then call the API with what came back", C`using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

var http = new HttpClient(new FakeServer(async request =>
{
    if (request.RequestUri!.AbsolutePath == "/token")
    {
        string form = await request.Content!.ReadAsStringAsync();
        return form.Contains("client_secret=s3cret")
            ? new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new { access_token = "t-81f", token_type = "Bearer", expires_in = 3600 }) }
            : new HttpResponseMessage(HttpStatusCode.Unauthorized) { Content = JsonContent.Create(new { error = "invalid_client" }) };
    }
    return request.Headers.Authorization?.Parameter == "t-81f"
        ? new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("3 notes") }
        : new HttpResponseMessage(HttpStatusCode.Unauthorized);
}))
{
    BaseAddress = new Uri("https://auth.example/")
};

var login = await http.PostAsync("token", new FormUrlEncodedContent(new Dictionary<string, string>
{
    ["grant_type"] = "client_credentials",
    ["client_id"] = "planner",
    ["client_secret"] = "s3cret"   // from user secrets in a real app
}));
var token = await login.Content.ReadFromJsonAsync<TokenReply>();
Console.WriteLine($"{token!.Token_Type} token for {token.Expires_In / 60} minutes");

http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.Access_Token);
Console.WriteLine(await http.GetStringAsync("notes"));

record TokenReply(string Access_Token, string Token_Type, int Expires_In);` + FAKE_ASYNC),
      page("Pitfalls"),
      { h: "Authorization is not a string — CS0029" },
      run("pit-auth", "the header is an AuthenticationHeaderValue", C`var request = new HttpRequestMessage(HttpMethod.Get, "https://api.example/notes");
request.Headers.Authorization = "Bearer t-81f";`),
      "`new AuthenticationHeaderValue(\"Bearer\", token)` (from `System.Net.Http.Headers`).",
      { h: "A key in the URL" },
      "`https://api.example/now?key=k-7f3a` ends up in server logs, proxy logs, browser history and screenshots. Send keys in headers.",
      { h: "Decoding is not verifying" },
      "Base64url is an encoding, not encryption: a JWT's claims are readable by anyone, and changeable by anyone who does not need the signature checked. A server that trusts a token without verifying it lets anyone in.",
      { h: "A secret committed to Git" },
      "Deleting it in the next commit does not help: it stays in the history, and bots scan public repositories for keys within minutes. Revoke the key, make a new one, and keep it in user secrets.",
      page("Connections"),
      { ul: [ "**Back:** T1.18 headers; T1.19 JSON bodies; 11.3 configuration in layers.", "**Next:** T1F protects its API with a key from configuration and user secrets; T6 goes deeper into security.", "**AQA:** 4.9.3 network security — authentication; 4.9.4.2 HTTPS." ] },
      page("Good practice"),
      { ul: [ "Secrets come from the environment or user secrets — never the source, never a URL.", "Answer 401 for who-are-you and 403 for not-allowed.", "Ask for the narrowest scope, and let tokens expire." ] },
      page("Practise"),
      { ul: [ "**Tasks:** *Read a token* and *Log in, then call*." ] },
      page("Quick reference"),
      run("qr", "the two headers", C`using System.Net.Http.Headers;

var http = new HttpClient();
http.DefaultRequestHeaders.Add("X-Api-Key", Environment.GetEnvironmentVariable("API_KEY") ?? "k-demo");
http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "t-81f");
foreach (var h in http.DefaultRequestHeaders) Console.WriteLine($"{h.Key}: {string.Join(" ", h.Value)}");`),
      { ul: [ "`http.DefaultRequestHeaders.Add(\"X-Api-Key\", key)`", "`request.Headers.Authorization = new AuthenticationHeaderValue(\"Bearer\", token)`", "401 unauthenticated · 403 forbidden · JWT = header.payload.signature, base64url." ] },
      { table: { head: ["Error", "Means", "Page"], rows: [["CS0029", "a string where an AuthenticationHeaderValue is wanted", "Pitfalls"]] } }
    ],
    practice: {
      predict: [
        { id: "p1", src: C`foreach (var (hasToken, allowed) in new[] { (false, false), (true, false), (true, true) })
    Console.Write((hasToken ? allowed ? 200 : 403 : 401) + " ");
Console.WriteLine();`, why: "No credentials is 401; known but not allowed is 403.", concepts: ["http-auth"] },
        { id: "p2", src: C`string token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZGEifQ.c2ln";
string[] parts = token.Split('.');
Console.WriteLine($"{parts.Length} {parts[1].Length} {System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(parts[1] + "=="))}");`, why: "A JWT has three parts; the payload is base64url JSON, here {\"sub\":\"ada\"} once its padding is put back.", concepts: ["jwt"] }
      ],
      fill: [
        { id: "f1", q: "Fill the gap so the request carries a bearer token.", src: C`using System.Net.Http.Headers;

var request = new HttpRequestMessage(HttpMethod.Get, "https://api.example/notes");
request.Headers.Authorization = new AuthenticationHeaderValue(@@, "t-81f");
Console.WriteLine(request.Headers.Authorization);`, out: "Bearer t-81f", answer: "\"Bearer\"", concepts: ["http-auth"] }
      ],
      bug: [
        { id: "b1", q: "A valid token without the write scope should get 403, not 401.", src: C`using System.Net;
using System.Net.Http.Headers;

var http = new HttpClient(new FakeServer(request =>
{
    string? token = request.Headers.Authorization?.Parameter;
    bool known = token is "t-reader" or "t-admin";
    bool mayWrite = token == "t-admin";
    return new HttpResponseMessage(known && mayWrite ? HttpStatusCode.NoContent : HttpStatusCode.Unauthorized);
}));
foreach (string token in new[] { "t-nobody", "t-reader", "t-admin" })
{
    var request = new HttpRequestMessage(HttpMethod.Delete, "https://api.example/notes/4");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    Console.WriteLine($"{token}: {(int)(await http.SendAsync(request)).StatusCode}");
}` + FAKE, out: "t-nobody: 401\nt-reader: 403\nt-admin: 204", fixedText: "t-reader gets 403", why: "Unknown → 401; known but not allowed → 403. Decide them separately: !known ? Unauthorized : !mayWrite ? Forbidden : NoContent.", concepts: ["http-auth"] }
      ]
    },
    flashcards: [
      ["Authentication or authorisation: \"may you delete this?\"", "Authorisation (what you may do). Authentication is who you are."],
      ["401 or 403?", "401: no valid credentials. 403: known, but not allowed."],
      ["What are the three parts of a JWT?", "header.payload.signature, each base64url-encoded."],
      ["Can anyone read a JWT's claims?", "Yes: base64url is not encryption. Only the signature needs the issuer's key."],
      ["Where should an API key live during development?", "In user secrets or an environment variable — never in the code or Git."],
      ["What does the exp claim hold?", "The expiry time in Unix seconds (since 1 January 1970, UTC)."]
    ],
    quiz: [
      { q: "A JWT's payload says \"role\":\"admin\". The server should…", opts: ["trust it", "verify the signature first", "decrypt it", "ask the client"], ans: 1, why: "Anyone can write claims; only a valid signature makes them true." },
      { q: "An API key was pushed to a public repository. The fix is…", opts: ["delete it in the next commit", "make the repository private", "revoke it and issue a new one", "rename the variable"], ans: 2, why: "It is in the history and may already be copied." },
      { q: "OAuth's client-credentials flow gives a token to…", opts: ["a user typing a password into your app", "a program using its own client id and secret", "anyone", "a browser cookie"], ans: 1, why: "It is machine-to-machine; users log in through the authorization-code flow." }
    ]
  });
  /* the tokens the "Read a token" task reads: base64url JSON, signature "sig" */
  var JWT_KAI = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrYWkiLCJzY29wZSI6Im5vdGVzLnJlYWQgbm90ZXMud3JpdGUiLCJleHAiOjE3OTMwMDAwMDB9.c2ln";
  var JWT_ADA = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZGEiLCJzY29wZSI6IndlYXRoZXIiLCJleHAiOjE3NjAwMDAwMDB9.c2ln";
  var JWT_LIN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MDAwMDAwMDAsInN1YiI6ImxpbiIsInNjb3BlIjoiYSBiIGMiLCJuYW1lIjoiTGluIMOYIn0.c2ln";
  var AUTH_SERVER = C`
string[] first = (Console.ReadLine() ?? "").Split(' ');
int issued = 0;
var uses = new Dictionary<string, int>();
var http = new HttpClient(new FakeServer(async request =>
{
    if (request.RequestUri!.AbsolutePath == "/token")
    {
        string form = await request.Content!.ReadAsStringAsync();
        if (!form.Contains("client_id=planner") || !form.Contains("client_secret=s3cret"))
            return new HttpResponseMessage(HttpStatusCode.Unauthorized) { Content = JsonContent.Create(new { error = "invalid_client" }) };
        issued++;
        return new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(new { access_token = $"t-{issued}", token_type = "Bearer" }) };
    }
    // a token is good for two requests, then expires
    string token = request.Headers.Authorization?.Parameter ?? "";
    int used = uses.GetValueOrDefault(token);
    if (token != $"t-{issued}" || used >= 2) return new HttpResponseMessage(HttpStatusCode.Unauthorized);
    uses[token] = used + 1;
    int id = int.Parse(request.RequestUri.Segments.Last());
    return id <= 3
        ? new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(new[] { "buy milk", "ring Kai", "revise graphs" }[id - 1]) }
        : new HttpResponseMessage(HttpStatusCode.NotFound);
}))
{
    BaseAddress = new Uri("https://notes.example/")
};
`;
  K.add({ tasks: {
    "T1.22-jwt": { lesson: "T1.22", title: "Read a token", tier: "core", minutes: 20, concepts: ["jwt"],
      statement: ["The first line is a token; the second is the time now, in Unix seconds.", "If the token does not have three parts separated by dots, print `not a JWT`. Otherwise decode its payload (base64url JSON) and print `subject SUB`, `scopes A, B` (its `scope` claim split on spaces), `expires YYYY-MM-DD HH:mm UTC` (its `exp`), then `valid for M more minutes` or `expired M minutes ago` (whole minutes, rounded down)."],
      starter: C`using System.Text;
using System.Text.Json;

string token = Console.ReadLine() ?? "";
long now = long.Parse(Console.ReadLine() ?? "0");
`,
      examples: [{ stdin: JWT_KAI + "\n1792996400", out: "subject kai\nscopes notes.read, notes.write\nexpires 2026-10-26 07:33 UTC\nvalid for 60 more minutes" }],
      hidden: [{ stdin: JWT_ADA + "\n1760000125", out: "subject ada\nscopes weather\nexpires 2025-10-09 08:53 UTC\nexpired 2 minutes ago" }, { stdin: "abc.def\n1", out: "not a JWT" }, { stdin: JWT_LIN + "\n1799999999", out: "subject lin\nscopes a, b, c\nexpires 2027-01-15 08:00 UTC\nvalid for 0 more minutes" }],
      rules: [uses(/FromBase64String\s*\(/, "Decode the payload's base64."), uses(/JsonDocument|JsonNode|JsonSerializer/, "Read the payload as JSON.", "json")],
      hints: ["string b64 = parts[1].Replace('-', '+').Replace('_', '/'); b64 += new string('=', (4 - b64.Length % 4) % 4);", "using var doc = JsonDocument.Parse(Encoding.UTF8.GetString(Convert.FromBase64String(b64))); var claims = doc.RootElement;", "DateTimeOffset.FromUnixTimeSeconds(exp).ToString(\"yyyy-MM-dd HH:mm\"); minutes = (exp - now) / 60 (or (now - exp) / 60)."],
      answer: C`using System.Text;
using System.Text.Json;

string token = Console.ReadLine() ?? "";
long now = long.Parse(Console.ReadLine() ?? "0");
string[] parts = token.Split('.');
if (parts.Length != 3)
{
    Console.WriteLine("not a JWT");
    return;
}
string b64 = parts[1].Replace('-', '+').Replace('_', '/');
b64 += new string('=', (4 - b64.Length % 4) % 4);
using var doc = JsonDocument.Parse(Encoding.UTF8.GetString(Convert.FromBase64String(b64)));
var claims = doc.RootElement;
long exp = claims.GetProperty("exp").GetInt64();
Console.WriteLine($"subject {claims.GetProperty("sub").GetString()}");
Console.WriteLine($"scopes {string.Join(", ", claims.GetProperty("scope").GetString()!.Split(' '))}");
Console.WriteLine($"expires {DateTimeOffset.FromUnixTimeSeconds(exp):yyyy-MM-dd HH:mm} UTC");
Console.WriteLine(exp > now ? $"valid for {(exp - now) / 60} more minutes" : $"expired {(now - exp) / 60} minutes ago");` },
    "T1.22-login": { lesson: "T1.22", title: "Log in, then call", tier: "stretch", minutes: 25, concepts: ["http-auth"],
      statement: ["The first line is `CLIENT_ID SECRET`; each line after it is a note id. The starter's server issues tokens at `POST token` (a form: `grant_type=client_credentials`, `client_id`, `client_secret`), answering `{\"access_token\":…}` or 401 with `{\"error\":…}`. `GET notes/ID` needs `Authorization: Bearer TOKEN`, and a token expires after two requests (401).", "Log in once. If that fails, print `login failed: ERROR` and stop. Otherwise GET each note, printing `ID: TEXT` or `ID: not found`; on a 401, log in again and retry that note once. Finally print `tokens T`."],
      starter: C`using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
` + AUTH_SERVER + C`
record TokenReply(string Access_Token);
record Failure(string Error);` + FAKE_ASYNC,
      examples: [{ stdin: "planner s3cret\n1\n2\n3\n9", out: "1: buy milk\n2: ring Kai\n3: revise graphs\n9: not found\ntokens 2" }],
      hidden: [{ stdin: "planner wrong\n1", out: "login failed: invalid_client" }, { stdin: "planner s3cret\n2", out: "2: ring Kai\ntokens 1" }, { stdin: "planner s3cret\n4\n4\n4\n1\n1", out: "4: not found\n4: not found\n4: not found\n1: buy milk\n1: buy milk\ntokens 3" }],
      rules: [uses(/FormUrlEncodedContent/, "Log in with a FormUrlEncodedContent body."), uses(/AuthenticationHeaderValue\s*\(\s*"Bearer"/, "Send the token as a Bearer Authorization header.", "bearer")],
      hints: ["async Task<string?> LogIn() { var reply = await http.PostAsync(\"token\", new FormUrlEncodedContent(new Dictionary<string, string> { [\"grant_type\"] = \"client_credentials\", [\"client_id\"] = first[0], [\"client_secret\"] = first[1] })); … }", "http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(\"Bearer\", token);", "var response = await http.GetAsync($\"notes/{id}\"); if (response.StatusCode == HttpStatusCode.Unauthorized) { log in again; response = await http.GetAsync($\"notes/{id}\"); }"],
      answer: C`using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
` + AUTH_SERVER + C`
int tokens = 0;
if (!await LogIn()) return;
string? line;
while ((line = Console.ReadLine()) is not null && line != "")
{
    var response = await http.GetAsync($"notes/{line}");
    if (response.StatusCode == HttpStatusCode.Unauthorized)
    {
        if (!await LogIn()) return;
        response = await http.GetAsync($"notes/{line}");
    }
    Console.WriteLine(response.IsSuccessStatusCode ? $"{line}: {await response.Content.ReadAsStringAsync()}" : $"{line}: not found");
}
Console.WriteLine($"tokens {tokens}");

async Task<bool> LogIn()
{
    var reply = await http.PostAsync("token", new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["grant_type"] = "client_credentials",
        ["client_id"] = first[0],
        ["client_secret"] = first[1]
    }));
    if (!reply.IsSuccessStatusCode)
    {
        var failure = await reply.Content.ReadFromJsonAsync<Failure>();
        Console.WriteLine($"login failed: {failure!.Error}");
        return false;
    }
    var token = await reply.Content.ReadFromJsonAsync<TokenReply>();
    tokens++;
    http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token!.Access_Token);
    return true;
}

record TokenReply(string Access_Token);
record Failure(string Error);` + FAKE_ASYNC }
  } });

  /* ================================================================
     retrieval cards (skill cards) for T1D
     ================================================================ */
  K.add({ cards: {
    "t1d-status": { title: "Which kind of answer?", lesson: "T1.18", concepts: ["http-status"], kind: "predict",
      vary: function (r) {
        var pool = [200, 201, 204, 301, 304, 400, 401, 403, 404, 409, 429, 500, 502, 503];
        var picks = [];
        while (picks.length < 4) { var c = pool[r(pool.length)]; if (picks.indexOf(c) < 0) picks.push(c); }
        return { prompt: "What does this print?", label: "four status codes", params: [],
          src: "using System.Net;\n\nforeach (int c in new[] { " + picks.join(", ") + " })\n{\n    var r = new HttpResponseMessage((HttpStatusCode)c);\n    Console.WriteLine($\"{c} {r.IsSuccessStatusCode} {(c >= 500 ? \"server\" : c >= 400 ? \"client\" : \"-\")}\");\n}",
          hint: "Success is 200–299; 4xx is the client's fault, 5xx the server's." };
      } },
    "t1d-base": { title: "Base address plus path", lesson: "T1.19", concepts: ["httpclient"], kind: "predict",
      vary: function (r) {
        var host = pick(r, ["api.example", "weather.example", "notes.example"]);
        var ver = pick(r, ["v1", "v2", "api"]);
        var res = pick(r, ["books/7", "forecast/leeds", "notes"]);
        var combos = [[ver + "/", res], [ver, res], [ver + "/", "/" + res]];
        var a = combos[r(3)], b = combos[r(3)];
        return { prompt: "What does this print?", label: "two URLs on " + host, params: [],
          src: "Console.WriteLine(new Uri(new Uri(\"https://" + host + "/" + a[0] + "\"), \"" + a[1] + "\"));\nConsole.WriteLine(new Uri(new Uri(\"https://" + host + "/" + b[0] + "\"), \"" + b[1] + "\"));",
          hint: "Without a trailing slash the base's last segment is replaced; a leading slash on the path starts from the host." };
      } },
    "t1d-retry": { title: "How many attempts?", lesson: "T1.20", concepts: ["http-retries"], kind: "predict",
      vary: function (r) {
        var fails = r(5), max = 2 + r(3), code = pick(r, [503, 500, 429, 404]);
        return { prompt: "What does this print?", label: "a server that fails " + fails + " time(s) with " + code, params: [],
          src: "int calls = 0;\nint Answer() => ++calls <= " + fails + " ? " + code + " : 200;\n\nfor (int attempt = 1; attempt <= " + max + "; attempt++)\n{\n    int code = Answer();\n    Console.Write(code + \" \");\n    if (code == 200 || (code < 500 && code != 429)) break;\n}\nConsole.WriteLine($\"| {calls} call(s)\");",
          hint: "It stops at a success, at a code that is not worth retrying, or after the last attempt." };
      } },
    "t1d-rest": { title: "Which status?", lesson: "T1.21", concepts: ["rest-design"], kind: "predict",
      vary: function (r) {
        var have = [1 + r(3), 4 + r(3)];
        var ops = [["GET", "/books"], ["POST", "/books"], ["GET", "/books/" + have[0]], ["DELETE", "/books/" + have[1]], ["GET", "/books/9"], ["PATCH", "/books"], ["GET", "/books/x"]];
        var picks = [];
        while (picks.length < 4) { var o = ops[r(ops.length)]; if (picks.indexOf(o) < 0) picks.push(o); }
        return { prompt: "What does this print?", label: "a library with books " + have.join(" and "), params: [],
          src: "var books = new HashSet<int> { " + have.join(", ") + " };\nforeach (var (method, path) in new[] { " + picks.map(function (p) { return "(\"" + p[0] + "\", \"" + p[1] + "\")"; }).join(", ") + " })\n    Console.Write(Status(method, path) + \" \");\nConsole.WriteLine();\n\nint Status(string method, string path)\n{\n    string[] parts = path.Trim('/').Split('/');\n    if (parts.Length == 1) return method == \"GET\" ? 200 : method == \"POST\" ? 201 : 405;\n    if (!int.TryParse(parts[1], out int id)) return 400;\n    if (!books.Contains(id)) return 404;\n    return method == \"GET\" ? 200 : method == \"DELETE\" ? 204 : 405;\n}",
          hint: "Collection: 200 or 201. Item: 400 for a bad id, 404 if missing, then 200 or 204." };
      } },
    "t1d-auth": { title: "401 or 403?", lesson: "T1.22", concepts: ["http-auth"], kind: "predict",
      vary: function (r) {
        var calls = [["null", "GET"], ["\"t-reader\"", "GET"], ["\"t-reader\"", "DELETE"], ["\"t-admin\"", "DELETE"], ["\"t-old\"", "GET"]];
        var picks = [];
        while (picks.length < 3) { var c = calls[r(calls.length)]; if (picks.indexOf(c) < 0) picks.push(c); }
        return { prompt: "What does this print?", label: "three callers", params: [],
          src: "var scopes = new Dictionary<string, string> { [\"t-reader\"] = \"read\", [\"t-admin\"] = \"read write\" };\nforeach (var (token, method) in new (string?, string)[] { " + picks.map(function (p) { return "(" + p[0] + ", \"" + p[1] + "\")"; }).join(", ") + " })\n    Console.Write(Check(token, method) + \" \");\nConsole.WriteLine();\n\nint Check(string? token, string method)\n{\n    if (token is null || !scopes.TryGetValue(token, out string? can)) return 401;\n    return can.Contains(method == \"GET\" ? \"read\" : \"write\") ? 200 : 403;\n}",
          hint: "No token or an unknown one: 401. Known but without the scope: 403." };
      } },
    "t1d-send": { title: "Send the right method", lesson: "T1.18", concepts: ["http-exchange"], kind: "write",
      vary: function (r, n) {
        var m = [["Delete", "DELETE", 204], ["Put", "PUT", 204], ["Get", "GET", 200], ["Post", "POST", 201]][n % 4];
        var res = pick(r, ["books", "notes", "members"]), limit = 3 + r(5);
        var server = "using System.Net;\n\nvar http = new HttpClient(new FakeServer(request =>\n{\n    int id = int.Parse(request.RequestUri!.Segments.Last());\n    if (id > " + limit + ") return new HttpResponseMessage(HttpStatusCode.NotFound);\n    return new HttpResponseMessage(request.Method == HttpMethod." + m[0] + " ? (HttpStatusCode)" + m[2] + " : HttpStatusCode.MethodNotAllowed);\n}))\n{\n    BaseAddress = new Uri(\"https://api.example/\")\n};\n";
        var fake = "\n\nclass FakeServer(Func<HttpRequestMessage, HttpResponseMessage> answer) : HttpMessageHandler\n{\n    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)\n        => Task.FromResult(answer(request));\n}";
        var ids = [[1, limit + 2], [limit], [limit + 1, 2, 3]];
        var codeFor = function (id) { return id > limit ? 404 : m[2]; };
        return { prompt: "Read ids, one a line. For each, send a " + m[1] + " to `" + res + "/ID` through the starter's client with `SendAsync`, and print `" + m[1] + " /" + res + "/ID -> CODE`.",
          label: m[1] + " on /" + res, params: [m[1], res],
          starter: server + fake,
          cases: ids.map(function (xs) { return { stdin: xs.join("\n"), out: xs.map(function (x) { return m[1] + " /" + res + "/" + x + " -> " + codeFor(x); }).join("\n") }; }),
          rules: [{ id: "send", test: function (src) { return new RegExp("HttpMethod\\." + m[0] + "\\b").test(src.split("class FakeServer")[0].replace(/request\.Method == HttpMethod\.\w+/g, "")) && /SendAsync\s*\(/.test(src); }, msg: "Build the request with HttpMethod." + m[0] + " and send it with SendAsync." }],
          hint: "var response = await http.SendAsync(new HttpRequestMessage(HttpMethod." + m[0] + ", $\"" + res + "/{id}\"));",
          answer: server + "string? line;\nwhile ((line = Console.ReadLine()) is not null && line != \"\")\n{\n    var response = await http.SendAsync(new HttpRequestMessage(HttpMethod." + m[0] + ", $\"" + res + "/{line}\"));\n    Console.WriteLine($\"" + m[1] + " /" + res + "/{line} -> {(int)response.StatusCode}\");\n}" + fake };
      } }
  } });

  /* ================================================================
     the part's project, in Rider: the Weather client
     ================================================================ */
  var RUN = "src/Weather.Cli";
  K.project("rp-t1d-weather", {
    unit: "T1D", title: "Weather client", folder: "weather-client", solution: "WeatherClient.sln",
    scaffoldVersion: 1, minValidator: "1.1.0", sdk: ".NET 10 SDK",
    summary: "A weather client on HttpClient — JSON, retries with backoff, timeouts and cancellation, an API key kept out of the code — tested against a fake server, built in Rider.",
    brief: [
      "`WeatherClient.GetAsync(city, token)` returns a city's forecast, or null when the API does not know it, and turns every failure into a `WeatherException` a user can read. `src/Weather` is yours to build; `src/Weather.Cli` is the command line, with a demo server inside it; `tests/Weather.Tests` holds your tests; Kurenai's acceptance tests (`tests/Weather.Acceptance`) run it against a fake server for milestones 1–4.",
      { ul: [
        "Retry only what may work later — 408, 429, 5xx, no answer at all — with doubling waits; each attempt has its own deadline; the caller's cancellation is obeyed at once.",
        "The API key goes in an `X-Api-Key` header on every request, and in no `.cs` file: the command line reads it from appsettings.json, user secrets and environment variables, in that order.",
        "`Directory.Build.props`, `tests/Weather.Acceptance/` and `.kurenai/validate.cs` are **protected**."
      ] }
    ],
    milestones: [
      { id: "m1", title: "Fetch and read", lessons: ["T1.18", "T1.19"], about: "GET forecast/<city>, lower case and escaped, asking for JSON; read the Forecast; a 404 is null.", checks: [{ type: "tests", class: "Milestone1" }] },
      { id: "m2", title: "Errors and retries", lessons: ["T1.20"], about: "Retry 408, 429, 5xx and dropped connections up to the attempts, with doubling waits; fail at once on anything else.", checks: [{ type: "tests", class: "Milestone2" }] },
      { id: "m3", title: "Timeouts and cancellation", lessons: ["T1.20"], about: "A deadline per attempt from a linked token; the caller's cancellation obeyed, never retried.", checks: [{ type: "tests", class: "Milestone3" }, { type: "source", path: "src/Weather", contains: ["CreateLinkedTokenSource"] }] },
      { id: "m4", title: "The key, kept secret", lessons: ["T1.22"], about: "X-Api-Key on every request; a 401 not retried; no key, nothing sent; no key written in the code.",
        checks: [{ type: "tests", class: "Milestone4" }, { type: "source", path: "src", forbids: ["ApiKey\\s*=\\s*\"[^\"]+\"", "[?&](api_?key|key)=", "\"X-Api-Key\"\\s*,\\s*\"[^\"]+\""] }] },
      { id: "m5", title: "The command line, tested and committed", lessons: ["T1.18", "T1.19", "T1.20", "T1.21", "T1.22"], about: "Settings in layers (appsettings, user secrets, environment), the demo server, one city a line; five or more of your own tests; no warnings; committed.",
        checks: [
          { type: "source", path: "src/Weather.Cli", contains: ["AddUserSecrets", "AddEnvironmentVariables"] },
          { type: "run", project: RUN, stdin: "Leeds\natlantis\nLondon\nSt Ives\nquit\n", contains: ["Leeds: 11.5 C, rain", "atlantis: not found", "London: 14.5 C, sun", "St Ives: 13 C, showers", "Bye."] },
          { type: "owntests", prefix: "Weather.Tests.", min: 5 }, { type: "warnings", max: 0 }, { type: "git" }
        ] }
    ],
    protected: ["Directory.Build.props", "tests/Weather.Acceptance/Weather.Acceptance.csproj", "tests/Weather.Acceptance/FakeServer.cs", "tests/Weather.Acceptance/Milestone1.cs", "tests/Weather.Acceptance/Milestone2.cs", "tests/Weather.Acceptance/Milestone3.cs", "tests/Weather.Acceptance/Milestone4.cs", ".kurenai/validate.cs"],
    reward: { xp: 140, gold: 35, hp: 8 }
  });
})();
