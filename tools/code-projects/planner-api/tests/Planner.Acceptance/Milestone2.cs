namespace Planner.Acceptance;

/// <summary>Milestone 2 · validation as problem details, tidy input, a filter, the right codes.</summary>
public class Milestone2
{
    [Fact]
    public async Task An_invalid_topic_is_400_with_an_error_per_field()
    {
        await using var api = new Api();
        var errors = await Api.Errors(await api.Client().PostAsJsonAsync("/topics", new { subject = " ", title = "", confidence = 9 }));
        Assert.Equal(new[] { "Choose a subject." }, errors["subject"]);
        Assert.Equal(new[] { "Give the topic a title." }, errors["title"]);
        Assert.Equal(new[] { "Confidence is 1 to 5." }, errors["confidence"]);
    }

    [Fact]
    public async Task A_title_over_60_characters_is_refused()
    {
        await using var api = new Api();
        var errors = await Api.Errors(await api.Client().PostAsJsonAsync("/topics", new { subject = "cs", title = new string('x', 61), confidence = 3 }));
        Assert.Equal(new[] { "At most 60 characters." }, errors["title"]);
        Assert.False(errors.ContainsKey("subject"));
    }

    [Fact]
    public async Task PUT_is_validated_too_and_changes_nothing_when_invalid()
    {
        await using var api = new Api();
        var c = api.Client();
        await Api.Add(c, "cs", "Big O", 3);
        await Api.Errors(await c.PutAsJsonAsync("/topics/1", new { subject = "cs", title = "Big O", confidence = 0 }));
        Assert.Equal(3, (await c.GetFromJsonAsync<Api.Topic>("/topics/1"))!.Confidence);
    }

    [Fact]
    public async Task Subject_and_title_are_trimmed_and_the_subject_lower_case()
    {
        await using var api = new Api();
        var t = await Api.Add(api.Client(), "  Maths ", "  Vectors ", 2);
        Assert.Equal(("maths", "Vectors"), (t.Subject, t.Title));
    }

    [Fact]
    public async Task The_list_filters_by_subject_ignoring_case()
    {
        await using var api = new Api();
        var c = api.Client();
        await Api.Add(c, "cs", "Big O", 3);
        await Api.Add(c, "maths", "Vectors", 2);
        await Api.Add(c, "cs", "Graphs", 1);
        Assert.Equal(new[] { "Big O", "Graphs" }, (await c.GetFromJsonAsync<List<Api.Topic>>("/topics?subject=CS"))!.Select(t => t.Title));
        Assert.Empty((await c.GetFromJsonAsync<List<Api.Topic>>("/topics?subject=history"))!);
    }

    [Fact]
    public async Task An_id_that_is_not_a_number_is_not_a_route()
    {
        await using var api = new Api();
        Assert.Equal(HttpStatusCode.NotFound, (await api.Client().GetAsync("/topics/abc")).StatusCode);
    }

    [Fact]
    public async Task Broken_JSON_is_a_400()
    {
        await using var api = new Api();
        var r = await api.Client().PostAsync("/topics", new StringContent("{ \"title\": ", System.Text.Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }
}
