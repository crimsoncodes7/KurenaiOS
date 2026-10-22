namespace Library.Acceptance;

/// <summary>Milestone 5 · Reminders depends on INotifier, not on SmtpSender.</summary>
public class Milestone5
{
    sealed class FakeNotifier : INotifier
    {
        public List<(string To, string Text)> Sent { get; } = new();
        public void Send(string to, string text) => Sent.Add((to, text));
    }

    static (Reminders Reminders, FakeNotifier Fake) Make()
    {
        var fake = new FakeNotifier();
        var ctor = typeof(Reminders).GetConstructor(new[] { typeof(INotifier) });
        Assert.True(ctor is not null, "Reminders needs a constructor that takes an INotifier.");
        return ((Reminders)ctor.Invoke(new object[] { fake }), fake);
    }

    [Fact]
    public void Only_overdue_loans_get_a_reminder()
    {
        var (reminders, fake) = Make();
        var today = new DateOnly(2026, 3, 10);
        int sent = reminders.SendOverdue(new[]
        {
            ("ada@school.test", new Loan("Dune", "book", new DateOnly(2026, 3, 1))),
            ("kai@school.test", new Loan("Emma", "book", today))
        }, today);
        Assert.Equal(1, sent);
        Assert.Equal(("ada@school.test", "\"Dune\" was due on 2026-03-01."), Assert.Single(fake.Sent));
    }

    [Fact]
    public void Nothing_is_sent_when_nothing_is_overdue()
    {
        var (reminders, fake) = Make();
        Assert.Equal(0, reminders.SendOverdue(Array.Empty<(string, Loan)>(), new DateOnly(2026, 3, 10)));
        Assert.Empty(fake.Sent);
    }
}
