/* Kurenai OS — tools/cs-wasm: the editor's live help (UR-23).
   Assist(req) answers the Code editor while the learner types: the
   compiler's own errors and warnings for every file, and the names that fit
   at the caret (what is in scope, or a type's members after a dot). It
   compiles but never emits or runs anything, so no learner code executes
   here. One compilation is kept and each edit replaces only the tree that
   changed, re-parsed incrementally from the edit's span, so a keystroke
   costs a re-bind, not a cold compile.
     req  { files:[{name,src}], nullable, diag:bool, file, pos, explicit }
     res  { diags:[{file,s,e,sl,sc,el,ec,code,msg,sev}], complete:{start,end,items:[{l,k,d}]}, ms } */
using System.Globalization;
using System.Runtime.InteropServices.JavaScript;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;

public static partial class Runner
{
    static CSharpCompilation? aComp;
    static bool aNullable;
    static readonly Dictionary<string, SyntaxTree> aTrees = new();
    static readonly CSharpParseOptions aParse = new(LanguageVersion.CSharp14);
    /* unused local functions are how a method-mode task is written */
    static readonly HashSet<string> aQuiet = new() { "CS8321" };
    static readonly string[] Keywords = ("abstract as async await base bool break byte case catch char checked class const continue decimal default " +
        "delegate do double else enum event explicit false finally fixed float for foreach get if implicit in init int interface internal is lock " +
        "long nameof namespace new not null object operator or and out override params private protected public readonly record ref required return " +
        "sealed set short sizeof static string struct switch this throw true try typeof uint ulong unchecked using var virtual void when where while with yield").Split(' ');

    [JSExport]
    public static string Assist(string reqJson)
    {
        var t0 = DateTime.UtcNow;
        var res = new JsonObject();
        try
        {
            var req = JsonNode.Parse(reqJson)!.AsObject();
            var comp = AssistCompilation(req["files"]!.AsArray(), req["nullable"]?.GetValue<bool>() ?? false);
            if (req["diag"]?.GetValue<bool>() ?? true) res["diags"] = Diags(comp);
            var file = (string?)req["file"];
            var pos = req["pos"]?.GetValue<int>() ?? -1;
            if (file != null && pos >= 0 && aTrees.TryGetValue(file, out var tree))
                res["complete"] = Complete(comp, tree, pos, req["explicit"]?.GetValue<bool>() ?? false);
        }
        catch (Exception e) { res["error"] = e.GetType().Name + ": " + e.Message; }
        res["ms"] = (int)(DateTime.UtcNow - t0).TotalMilliseconds;
        return res.ToJsonString();
    }

    static CSharpCompilation AssistCompilation(JsonArray files, bool nullable)
    {
        var names = files.Select(f => (string?)f!["name"] ?? "Program.cs").ToList();
        bool fresh = aComp == null || nullable != aNullable || names.Count != aTrees.Count || names.Any(n => !aTrees.ContainsKey(n));
        if (fresh)
        {
            aTrees.Clear();
            var trees = new List<SyntaxTree> { CSharpSyntaxTree.ParseText(GlobalUsings, aParse, "GlobalUsings.g.cs", Encoding.UTF8) };
            foreach (var f in files)
            {
                var t = CSharpSyntaxTree.ParseText(SourceText.From((string?)f!["src"] ?? "", Encoding.UTF8), aParse, (string?)f["name"] ?? "Program.cs");
                aTrees[t.FilePath] = t; trees.Add(t);
            }
            aNullable = nullable;
            aComp = CSharpCompilation.Create("Assist", trees, Refs(), new CSharpCompilationOptions(OutputKind.ConsoleApplication,
                nullableContextOptions: nullable ? NullableContextOptions.Enable : NullableContextOptions.Disable, concurrentBuild: false));
            return aComp;
        }
        foreach (var f in files)
        {
            var name = (string?)f!["name"] ?? "Program.cs";
            var src = (string?)f["src"] ?? "";
            var old = aTrees[name];
            var oldText = old.GetText();
            var now = oldText.ToString();
            if (now == src) continue;
            /* the edit as one span: the common start and end stay, so the
               parser reuses every node outside it */
            int a = 0, max = Math.Min(now.Length, src.Length);
            while (a < max && now[a] == src[a]) a++;
            int b = 0;
            while (b < max - a && now[now.Length - 1 - b] == src[src.Length - 1 - b]) b++;
            var changed = oldText.WithChanges(new TextChange(TextSpan.FromBounds(a, now.Length - b), src.Substring(a, src.Length - b - a)));
            var next = old.WithChangedText(changed);
            aComp = aComp!.ReplaceSyntaxTree(old, next);
            aTrees[name] = next;
        }
        return aComp!;
    }

    static JsonArray Diags(CSharpCompilation comp)
    {
        var list = new JsonArray();
        foreach (var d in comp.GetDiagnostics().Where(d => d.Severity >= DiagnosticSeverity.Warning && d.Location.IsInSource
                     && d.Location.SourceTree!.FilePath != "GlobalUsings.g.cs" && !aQuiet.Contains(d.Id))
                     .OrderBy(d => d.Severity == DiagnosticSeverity.Error ? 0 : 1).ThenBy(d => d.Location.SourceSpan.Start).Take(100))
        {
            var span = d.Location.SourceSpan;
            var lp = d.Location.GetLineSpan();
            list.Add(new JsonObject
            {
                ["file"] = d.Location.SourceTree!.FilePath, ["s"] = span.Start, ["e"] = span.End,
                ["sl"] = lp.StartLinePosition.Line + 1, ["sc"] = lp.StartLinePosition.Character,
                ["el"] = lp.EndLinePosition.Line + 1, ["ec"] = lp.EndLinePosition.Character,
                ["code"] = d.Id, ["msg"] = d.GetMessage(CultureInfo.InvariantCulture),
                ["sev"] = d.Severity == DiagnosticSeverity.Error ? "error" : "warning"
            });
        }
        return list;
    }

    static JsonObject Complete(CSharpCompilation comp, SyntaxTree tree, int pos, bool asked)
    {
        var text = tree.GetText();
        pos = Math.Clamp(pos, 0, text.Length);
        int start = pos;
        while (start > 0 && (char.IsLetterOrDigit(text[start - 1]) || text[start - 1] == '_')) start--;
        var prefix = text.ToString(TextSpan.FromBounds(start, pos));
        var outp = new JsonObject { ["start"] = start, ["end"] = pos, ["items"] = new JsonArray() };
        var root = tree.GetRoot();
        /* nothing inside a comment, a string or a number */
        if (start > 0)
        {
            var tr = root.FindTrivia(start - 1);
            if (tr.IsKind(SyntaxKind.SingleLineCommentTrivia) || tr.IsKind(SyntaxKind.MultiLineCommentTrivia) || tr.IsKind(SyntaxKind.SingleLineDocumentationCommentTrivia)) return outp;
        }
        var here = root.FindToken(Math.Max(0, Math.Min(start, text.Length - 1)));
        if (here.Span.Contains(start) && here.Span.Start < start &&
            (here.IsKind(SyntaxKind.StringLiteralToken) || here.IsKind(SyntaxKind.InterpolatedStringTextToken) || here.IsKind(SyntaxKind.CharacterLiteralToken))) return outp;
        if (prefix.Length > 0 && char.IsDigit(prefix[0])) return outp;

        var model = comp.GetSemanticModel(tree);
        int d = start - 1;
        while (d >= 0 && (text[d] == ' ' || text[d] == '\t')) d--;
        IEnumerable<ISymbol> syms;
        bool member = false;
        if (d >= 0 && text[d] == '.')
        {
            var dot = root.FindToken(d);
            ExpressionSyntax? left = dot.Parent switch
            {
                MemberAccessExpressionSyntax ma => ma.Expression,
                QualifiedNameSyntax qn => qn.Left,
                MemberBindingExpressionSyntax mb => (mb.Parent as ConditionalAccessExpressionSyntax)?.Expression
                    ?? mb.Ancestors().OfType<ConditionalAccessExpressionSyntax>().FirstOrDefault()?.Expression,
                _ => null
            };
            if (left == null) return outp;
            member = true;
            var sym = model.GetSymbolInfo(left).Symbol;
            var type = model.GetTypeInfo(left).Type;
            if (sym is INamespaceSymbol ns) syms = model.LookupNamespacesAndTypes(start, ns);
            /* a type's name before the dot (Console., int., Math.): its statics */
            else if (sym is ITypeSymbol ts && left is NameSyntax or PredefinedTypeSyntax)
                syms = model.LookupStaticMembers(start, ts).Concat(model.LookupNamespacesAndTypes(start, ts));
            else if (type != null && type.TypeKind != TypeKind.Error)
                syms = model.LookupSymbols(start, type, includeReducedExtensionMethods: true).Where(s => !s.IsStatic || s is IMethodSymbol { MethodKind: MethodKind.ReducedExtension });
            else return outp;
        }
        else
        {
            if (prefix.Length == 0 && !asked) return outp;
            syms = model.LookupSymbols(start);
        }

        var groups = syms.Where(s => !s.IsImplicitlyDeclared && SyntaxFacts.IsValidIdentifier(s.Name) && Matches(s.Name, prefix)
                                     && !(s is IMethodSymbol m && (m.MethodKind is MethodKind.Constructor or MethodKind.StaticConstructor or MethodKind.Destructor or MethodKind.PropertyGet or MethodKind.PropertySet or MethodKind.EventAdd or MethodKind.EventRemove)))
            .GroupBy(s => s.Name).Select(g => (name: g.Key, first: g.First(), count: g.Count())).ToList();
        var items = groups.Select(g => (g.name, kind: Kind(g.first), detail: Detail(g.first, g.count), rank: Rank(g.first, g.name, prefix, member))).ToList();
        if (!member)
            foreach (var k in Keywords)
                if (Matches(k, prefix) && prefix.Length > 0 && !items.Any(i => i.name == k)) items.Add((k, "keyword", "", 3 + (k.StartsWith(prefix, StringComparison.Ordinal) ? 0 : 10)));
        var arr = (JsonArray)outp["items"]!;
        foreach (var it in items.OrderBy(i => i.rank).ThenBy(i => i.name, StringComparer.OrdinalIgnoreCase).Take(60))
            arr.Add(new JsonObject { ["l"] = it.name, ["k"] = it.kind, ["d"] = it.detail });
        return outp;
    }

    /* a prefix, ignoring case, or its capitals: "WL" finds WriteLine */
    static bool Matches(string name, string prefix)
    {
        if (prefix.Length == 0) return true;
        if (name.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return name.Length > prefix.Length || name != prefix;
        if (prefix.Length < 2 || !prefix.All(char.IsUpper)) return false;
        var caps = new string(name.Where(char.IsUpper).ToArray());
        return caps.StartsWith(prefix, StringComparison.Ordinal);
    }
    static int Rank(ISymbol s, string name, string prefix, bool member)
    {
        int r = s switch
        {
            ILocalSymbol or IParameterSymbol or IRangeVariableSymbol => 0,
            IFieldSymbol or IPropertySymbol or IMethodSymbol or IEventSymbol => member ? 0 : 1,
            ITypeSymbol => 2,
            _ => 4
        };
        /* after a dot: the type's own members, then extensions and object's four */
        if (member && (s is IMethodSymbol { MethodKind: MethodKind.ReducedExtension } || s.ContainingType?.SpecialType == SpecialType.System_Object)) r += 1;
        return r + (name.StartsWith(prefix, StringComparison.Ordinal) ? 0 : 10);
    }
    static string Kind(ISymbol s) => s switch
    {
        ILocalSymbol or IRangeVariableSymbol => "local",
        IParameterSymbol => "parameter",
        IFieldSymbol f => f.IsConst || f.ContainingType?.TypeKind == TypeKind.Enum ? "constant" : "field",
        IPropertySymbol => "property",
        IEventSymbol => "event",
        IMethodSymbol => "method",
        INamedTypeSymbol t => t.TypeKind switch { TypeKind.Interface => "interface", TypeKind.Struct => "struct", TypeKind.Enum => "enum", TypeKind.Delegate => "delegate", _ => t.IsRecord ? "record" : "class" },
        INamespaceSymbol => "namespace",
        ITypeParameterSymbol => "type",
        _ => "name"
    };
    static readonly SymbolDisplayFormat Short = SymbolDisplayFormat.MinimallyQualifiedFormat
        .WithMemberOptions(SymbolDisplayMemberOptions.IncludeParameters | SymbolDisplayMemberOptions.IncludeType)
        .WithParameterOptions(SymbolDisplayParameterOptions.IncludeType | SymbolDisplayParameterOptions.IncludeName);
    static string Detail(ISymbol s, int count)
    {
        string d = s switch
        {
            ILocalSymbol l => l.Type.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat),
            IParameterSymbol p => p.Type.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat),
            IFieldSymbol or IPropertySymbol or IMethodSymbol or IEventSymbol => s.ToDisplayString(Short),
            _ => ""
        };
        if (s is IMethodSymbol && count > 1) d += " (+" + (count - 1) + " overload" + (count > 2 ? "s" : "") + ")";
        return d.Length > 120 ? d[..117] + "…" : d;
    }
}
