using Avalonia.Controls;
using Avalonia.Controls.Notifications;

namespace Focus;

/// <summary>Tells the user something happened.</summary>
public interface INotifier
{
    void Notify(string title, string message);
}

/// <summary>The real notifier: a toast in the corner of the window.</summary>
public class WindowNotifier : INotifier
{
    WindowNotificationManager? manager;
    public Window? Host { get; set; }

    public void Notify(string title, string message)
    {
        if (Host is null) return;
        manager ??= new WindowNotificationManager(TopLevel.GetTopLevel(Host)) { Position = NotificationPosition.BottomRight, MaxItems = 3 };
        manager.Show(new Notification(title, message, NotificationType.Information));
    }
}
