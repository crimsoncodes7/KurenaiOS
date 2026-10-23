namespace Notes;

/// <summary>Questions the app asks the user. The view models ask through this, so tests can answer.</summary>
public interface IDialogs
{
    Task<bool> ConfirmAsync(string question);
}
