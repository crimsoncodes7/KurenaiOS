namespace Tips;

/// <summary>The sums behind the window, kept apart from it so they can be tested on their own.</summary>
public static class TipMath
{
    /// <summary>The tip (to the nearest penny, halves up), the total, and each person's share
    /// (rounded UP to the penny, so the bill is always covered).</summary>
    public static (decimal Tip, decimal Total, decimal Each) Split(decimal bill, int percent, int people) =>
        throw new NotImplementedException();
}
