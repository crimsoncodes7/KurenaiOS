namespace Planner.Core;

/// <summary>One topic to revise. Confidence runs from 1 (shaky) to 5 (solid).</summary>
public record Topic(int Id, string Subject, string Name, int Confidence = 1, DateOnly? LastStudied = null);
