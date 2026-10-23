namespace Contacts;

/// <summary>One contact. Email may be missing (NULL in the table).</summary>
public record Contact(long Id, string Name, string? Email);
