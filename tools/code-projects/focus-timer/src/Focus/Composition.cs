using Microsoft.Extensions.DependencyInjection;

namespace Focus;

/// <summary>The composition root (milestone 1): every service registered in one place.</summary>
public static class Composition
{
    /// <summary>The app's services; settings live in dataFolder/settings.json.</summary>
    public static ServiceProvider Build(string dataFolder) => throw new NotImplementedException();
}
