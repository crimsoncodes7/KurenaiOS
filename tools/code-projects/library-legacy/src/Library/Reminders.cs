namespace Library;

public class Reminders
{
    public int SendOverdue(IEnumerable<(string Email, Loan Loan)> loans, DateOnly today)
    {
        var smtp = new SmtpSender();
        int sent = 0;
        foreach (var x in loans)
        {
            if (x.Loan.Due < today)
            {
                smtp.Send(x.Email, $"\"{x.Loan.Title}\" was due on {x.Loan.Due:yyyy-MM-dd}.");
                sent++;
            }
        }
        return sent;
    }
}
