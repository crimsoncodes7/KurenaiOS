using Avalonia.Controls;

namespace Reading;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new ReadingList();
    }
}
