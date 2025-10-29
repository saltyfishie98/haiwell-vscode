// src/languageServer.ts
import * as vscode from "vscode";

interface EcmaSymbol {
    name: string;
    kind: vscode.SymbolKind;
    range: vscode.Range;
    detail?: string;
}

export class EcmaLanguageServer {
    private keywords = [
        "function",
        "var",
        "const",
        "if",
        "else",
        "while",
        "for",
        "return",
        "class",
    ];

    private builtInFunctions = [
        {
            name: "print",
            detail: "print(message: string): void",
            doc: "Prints a message to console",
        },
        {
            name: "len",
            detail: "len(array: any[]): number",
            doc: "Returns the length of an array",
        },
        {
            name: "typeof",
            detail: "typeof(value: any): string",
            doc: "Returns the type of a value",
        },
        {
            name: "parse",
            detail: "parse(json: string): object",
            doc: "Parses JSON string",
        },
        {
            name: "stringify",
            detail: "stringify(obj: object): string",
            doc: "Converts object to JSON",
        },
    ];

    private types = ["string", "number", "boolean", "array", "object", "void"];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] {
        const linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);
        const completions: vscode.CompletionItem[] = [];

        // Keyword completions
        this.keywords.forEach((keyword) => {
            const item = new vscode.CompletionItem(
                keyword,
                vscode.CompletionItemKind.Keyword
            );
            item.detail = `ECMA 2 keyword`;
            completions.push(item);
        });

        // Built-in function completions
        this.builtInFunctions.forEach((func) => {
            const item = new vscode.CompletionItem(
                func.name,
                vscode.CompletionItemKind.Function
            );
            item.detail = func.detail;
            item.documentation = new vscode.MarkdownString(func.doc);
            item.insertText = new vscode.SnippetString(`${func.name}($1)$0`);
            completions.push(item);
        });

        // Function snippet
        const funcSnippet = new vscode.CompletionItem(
            "function",
            vscode.CompletionItemKind.Snippet
        );
        funcSnippet.insertText = new vscode.SnippetString(
            "function ${1:name}(${2:params}): ${3:void} {\n\t$0\n}"
        );
        funcSnippet.documentation = "Function declaration snippet";
        completions.push(funcSnippet);

        return completions;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Hover | null {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);

        // Check keywords
        if (this.keywords.includes(word)) {
            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(`keyword: ${word}`, "ecma2");
            markdown.appendMarkdown(`\n\nECMA 2 language keyword`);
            return new vscode.Hover(markdown, range);
        }

        // Check built-in functions
        const builtIn = this.builtInFunctions.find((f) => f.name === word);
        if (builtIn) {
            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(builtIn.detail, "ecma2");
            markdown.appendMarkdown(`\n\n${builtIn.doc}`);
            return new vscode.Hover(markdown, range);
        }

        // Check types
        if (this.types.includes(word)) {
            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(`type: ${word}`, "ecma2");
            return new vscode.Hover(markdown, range);
        }

        return null;
    }

    provideDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split("\n");

        lines.forEach((line, lineIndex) => {
            // Check for missing semicolons after statements
            const trimmed = line.trim();
            if (
                trimmed &&
                !trimmed.endsWith(";") &&
                !trimmed.endsWith("{") &&
                !trimmed.endsWith("}") &&
                !trimmed.startsWith("//") &&
                trimmed.match(/^(var|const|return|import|export)\s/)
            ) {
                const range = new vscode.Range(
                    lineIndex,
                    line.length,
                    lineIndex,
                    line.length
                );
                const diagnostic = new vscode.Diagnostic(
                    range,
                    "Missing semicolon",
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = "missing-semicolon";
                diagnostics.push(diagnostic);
            }

            // Check for undefined variables (simple check)
            const undefinedMatch = line.match(/\b([a-z_][a-z0-9_]*)\s*\(/gi);
            if (undefinedMatch) {
                undefinedMatch.forEach((match) => {
                    const funcName = match.replace("(", "").trim();
                    if (
                        !this.builtInFunctions.some(
                            (f) => f.name === funcName
                        ) &&
                        !this.keywords.includes(funcName)
                    ) {
                        // This is a potential undefined function
                        const index = line.indexOf(funcName);
                        const range = new vscode.Range(
                            lineIndex,
                            index,
                            lineIndex,
                            index + funcName.length
                        );
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            `Function '${funcName}' may not be defined`,
                            vscode.DiagnosticSeverity.Information
                        );
                        diagnostics.push(diagnostic);
                    }
                });
            }
        });

        return diagnostics;
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | null {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        const text = document.getText();

        // Find function definitions
        const funcRegex = new RegExp(`function\\s+${word}\\s*\\(`, "g");
        const match = funcRegex.exec(text);

        if (match) {
            const pos = document.positionAt(match.index);
            return new vscode.Location(document.uri, pos);
        }

        return null;
    }

    provideDocumentSymbols(
        document: vscode.TextDocument
    ): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const text = document.getText();
        const lines = text.split("\n");

        lines.forEach((line, lineIndex) => {
            // Find functions
            const funcMatch = line.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (funcMatch) {
                const name = funcMatch[1];
                const range = new vscode.Range(
                    lineIndex,
                    0,
                    lineIndex,
                    line.length
                );
                const symbol = new vscode.DocumentSymbol(
                    name,
                    "function",
                    vscode.SymbolKind.Function,
                    range,
                    range
                );
                symbols.push(symbol);
            }

            // Find modules
            const moduleMatch = line.match(/module\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (moduleMatch) {
                const name = moduleMatch[1];
                const range = new vscode.Range(
                    lineIndex,
                    0,
                    lineIndex,
                    line.length
                );
                const symbol = new vscode.DocumentSymbol(
                    name,
                    "module",
                    vscode.SymbolKind.Module,
                    range,
                    range
                );
                symbols.push(symbol);
            }

            // Find variables
            const varMatch = line.match(
                /(?:var|const)\s+([a-zA-Z_][a-zA-Z0-9_]*)/
            );
            if (varMatch) {
                const name = varMatch[1];
                const range = new vscode.Range(
                    lineIndex,
                    0,
                    lineIndex,
                    line.length
                );
                const symbol = new vscode.DocumentSymbol(
                    name,
                    "variable",
                    vscode.SymbolKind.Variable,
                    range,
                    range
                );
                symbols.push(symbol);
            }
        });

        return symbols;
    }
}
