namespace Library;

// Written in a hurry in 2019. It works, as far as anyone knows, and nobody
// has dared to touch it since. There are no tests.
public class LateFees
{
    public decimal Calculate(Loan loan)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        int d = today.DayNumber - loan.Due.DayNumber;
        if (d <= 0) return 0;
        decimal f;
        if (loan.Kind == "dvd")
        {
            f = d * 1.00m;
        }
        else
        {
            if (d <= 2) return 0;
            f = (d - 2) * 0.25m;
        }
        if (f > 10m) f = 10m;
        if (loan.Damaged) f += 5m;
        return f;
    }
}
