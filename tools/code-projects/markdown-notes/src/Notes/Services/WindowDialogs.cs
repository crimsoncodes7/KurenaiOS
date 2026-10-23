using Avalonia.Controls;
using Avalonia.Layout;

namespace Notes;

/// <summary>The real dialogs: a small modal window over the main one.</summary>
public class WindowDialogs(Window owner) : IDialogs
{
    public async Task<bool> ConfirmAsync(string question)
    {
        var yes = new Button { Content = "Delete", IsDefault = true };
        var no = new Button { Content = "Cancel", IsCancel = true };
        var dialog = new Window
        {
            Title = "Markdown notes", Width = 360, SizeToContent = SizeToContent.Height, CanResize = false,
            WindowStartupLocation = WindowStartupLocation.CenterOwner,
            Content = new StackPanel
            {
                Margin = new Avalonia.Thickness(16), Spacing = 12,
                Children =
                {
                    new TextBlock { Text = question, TextWrapping = Avalonia.Media.TextWrapping.Wrap },
                    new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8, HorizontalAlignment = HorizontalAlignment.Right, Children = { no, yes } }
                }
            }
        };
        yes.Click += (_, _) => dialog.Close(true);
        no.Click += (_, _) => dialog.Close(false);
        return await dialog.ShowDialog<bool>(owner);
    }
}
