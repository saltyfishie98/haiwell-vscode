import * as vscode from "vscode";
import * as path from "path";

export class HaiwellScriptDocumentSymbolProvider
    implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);

            const functionMatch = line.text.match(/function\s+(\w+)\s*\(/);
            if (functionMatch) {
                symbols.push(
                    new vscode.DocumentSymbol(
                        functionMatch[1],
                        "Function",
                        vscode.SymbolKind.Function,
                        line.range,
                        line.range
                    )
                );
            }

            const varMatch = line.text.match(/\b(var|let|const)\s+(\w+)\s*=/);
            if (varMatch) {
                symbols.push(
                    new vscode.DocumentSymbol(
                        varMatch[2],
                        "Variable",
                        vscode.SymbolKind.Variable,
                        line.range,
                        line.range
                    )
                );
            }
        }

        return symbols;
    }
}
