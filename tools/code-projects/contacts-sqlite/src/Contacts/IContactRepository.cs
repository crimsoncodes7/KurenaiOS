namespace Contacts;

/// <summary>Where contacts are kept. The program and the tests talk to this, never to SQL.</summary>
public interface IContactRepository
{
    /// <summary>Adds a contact and returns it with its new id. A blank name is an ArgumentException.</summary>
    Contact Add(string name, string? email);

    /// <summary>Every contact, in id order.</summary>
    IReadOnlyList<Contact> All();

    /// <summary>Contacts whose name contains the text, ignoring case, A–Z by name.</summary>
    IReadOnlyList<Contact> FindByName(string text);

    /// <summary>Adds every contact or none: if any one fails, nothing is kept. Returns how many were added.</summary>
    int Import(IEnumerable<(string Name, string? Email)> contacts);

    /// <summary>Removes every contact.</summary>
    void Clear();
}
