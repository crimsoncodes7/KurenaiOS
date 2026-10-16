/* The run-time support compiled with every learner program, and the
   rewriter that calls it: before each statement, __Kos.Rt.L(line) records
   the line (so an exception names the line it happened on, without a PDB —
   writing one needs a second thread this runtime does not have), counts a
   step, and stops a program that runs past its budget or its clock. Once
   stopped, every later call throws again, so a catch block cannot keep the
   program alive. Diagnostics always come from the learner's own source. */
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using static Microsoft.CodeAnalysis.CSharp.SyntaxFactory;

static class Instrument
{
    public const string Support = @"namespace __Kos {
  internal sealed class Budget : global::System.Exception { public Budget(string m) : base(m) { } }
  internal static class Rt {
    public static int Line; public static long Steps; public static long Max = 5000000; public static long Deadline; public static string? Stop;
    public static void L(int line) {
      Line = line;
      if (Stop != null) throw new Budget(Stop);
      if (++Steps > Max) { Stop = ""steps""; throw new Budget(Stop); }
      if ((Steps & 1023) == 0 && global::System.Environment.TickCount64 > Deadline) { Stop = ""time""; throw new Budget(Stop); }
      global::System.Runtime.CompilerServices.RuntimeHelpers.EnsureSufficientExecutionStack();
    }
  }
}";

    public static SyntaxTree Rewrite(SyntaxTree tree) => tree.WithRootAndOptions(new Rewriter().Visit(tree.GetRoot()), tree.Options);

    static StatementSyntax Mark(SyntaxNode at)
    {
        var line = at.GetLocation().GetLineSpan().StartLinePosition.Line + 1;
        return ExpressionStatement(InvocationExpression(ParseExpression("global::__Kos.Rt.L"),
            ArgumentList(SingletonSeparatedList(Argument(LiteralExpression(SyntaxKind.NumericLiteralExpression, Literal(line)))))));
    }

    sealed class Rewriter : CSharpSyntaxRewriter
    {
        static SyntaxList<StatementSyntax> Marked(SyntaxList<StatementSyntax> list, Func<StatementSyntax, StatementSyntax> visit)
        {
            var outList = new List<StatementSyntax>();
            foreach (var s in list)
            {
                var v = visit(s);
                if (s is not LocalFunctionStatementSyntax && s is not LabeledStatementSyntax) outList.Add(Mark(s));
                outList.Add(v);
            }
            return List(outList);
        }
        StatementSyntax V(StatementSyntax s) => (StatementSyntax)Visit(s)!;
        /* an embedded statement (if (x) y;) becomes a block so it can be marked */
        StatementSyntax Embed(StatementSyntax s) => s is BlockSyntax b ? (StatementSyntax)VisitBlock(b)! : Block(Mark(s), V(s));
        /* a loop's body always starts with a marker, even an empty one */
        StatementSyntax Loop(SyntaxNode loop, StatementSyntax s)
        {
            var b = Embed(s) as BlockSyntax ?? Block(Embed(s));
            return b.WithStatements(b.Statements.Insert(0, Mark(loop)));
        }

        public override SyntaxNode? VisitBlock(BlockSyntax node) => node.WithStatements(Marked(node.Statements, V));
        public override SyntaxNode? VisitSwitchSection(SwitchSectionSyntax node) => node.WithStatements(Marked(node.Statements, V));
        public override SyntaxNode? VisitIfStatement(IfStatementSyntax node) =>
            node.WithCondition((ExpressionSyntax)Visit(node.Condition)!).WithStatement(Embed(node.Statement)).WithElse(node.Else == null ? null : (ElseClauseSyntax)Visit(node.Else));
        public override SyntaxNode? VisitElseClause(ElseClauseSyntax node) =>
            node.WithStatement(node.Statement is IfStatementSyntax i ? (StatementSyntax)VisitIfStatement(i)! : Embed(node.Statement));
        public override SyntaxNode? VisitWhileStatement(WhileStatementSyntax node) => node.WithCondition((ExpressionSyntax)Visit(node.Condition)!).WithStatement(Loop(node, node.Statement));
        public override SyntaxNode? VisitDoStatement(DoStatementSyntax node) => node.WithCondition((ExpressionSyntax)Visit(node.Condition)!).WithStatement(Loop(node, node.Statement));
        public override SyntaxNode? VisitForStatement(ForStatementSyntax node) => ((ForStatementSyntax)base.VisitForStatement(node)!).WithStatement(Loop(node, node.Statement));
        public override SyntaxNode? VisitForEachStatement(ForEachStatementSyntax node) => node.WithExpression((ExpressionSyntax)Visit(node.Expression)!).WithStatement(Loop(node, node.Statement));
        public override SyntaxNode? VisitForEachVariableStatement(ForEachVariableStatementSyntax node) => node.WithExpression((ExpressionSyntax)Visit(node.Expression)!).WithStatement(Loop(node, node.Statement));
        public override SyntaxNode? VisitUsingStatement(UsingStatementSyntax node) => ((UsingStatementSyntax)base.VisitUsingStatement(node)!).WithStatement(Embed(node.Statement));
        public override SyntaxNode? VisitLockStatement(LockStatementSyntax node) => node.WithStatement(Embed(node.Statement));
        public override SyntaxNode? VisitFixedStatement(FixedStatementSyntax node) => node.WithStatement(Embed(node.Statement));
        public override SyntaxNode? VisitCheckedStatement(CheckedStatementSyntax node) => node.WithBlock((BlockSyntax)VisitBlock(node.Block)!);
        /* top-level statements: a marker before each one */
        public override SyntaxNode? VisitCompilationUnit(CompilationUnitSyntax node)
        {
            var members = new List<MemberDeclarationSyntax>();
            foreach (var m in node.Members)
            {
                if (m is GlobalStatementSyntax g)
                {
                    if (g.Statement is not LocalFunctionStatementSyntax) members.Add(GlobalStatement(Mark(g)));
                    members.Add(g.WithStatement(V(g.Statement)));
                }
                else members.Add((MemberDeclarationSyntax)Visit(m)!);
            }
            return node.WithMembers(List(members));
        }
    }
}
