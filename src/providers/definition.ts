import * as vscode from "vscode";
import * as path from "path";
import { ProjectObjectCache } from "../project_object_cache";

export class HaiwellScriptDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Definition | undefined> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return undefined;
        }

        const objectName = document.getText(range);
        const cache = ProjectObjectCache.getInstance();

        // First try to find a local declaration in the current document (var or function)
        const declarationRegexes = [
            new RegExp("\\b(?:var)\\s+" + objectName + "\\b"),
            new RegExp("\\bfunction\\s+" + objectName + "\\s*\\("),
            new RegExp("^\\s*" + objectName + "\\s*=", "m"),
        ];

        // Search the current document first
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;
            if (declarationRegexes.some((re) => re.test(line))) {
                const col = line.indexOf(objectName);
                return new vscode.Location(
                    document.uri,
                    new vscode.Position(i, col >= 0 ? col : 0)
                );
            }
        }

        // Search any open workspace documents (fast) for a declaration
        for (const doc of vscode.workspace.textDocuments) {
            if (doc.uri.toString() === document.uri.toString()) {
                continue; // already checked
            }
            try {
                for (let i = 0; i < doc.lineCount; i++) {
                    const line = doc.lineAt(i).text;
                    if (declarationRegexes.some((re) => re.test(line))) {
                        const col = line.indexOf(objectName);
                        return new vscode.Location(
                            doc.uri,
                            new vscode.Position(i, col >= 0 ? col : 0)
                        );
                    }
                }
            } catch (err) {
                // ignore and continue
            }
        }

        // Fall back to variable CSV definition if present
        const definition = cache.getObjectDefinition(objectName);
        if (definition) {
            const uri = vscode.Uri.file(definition.sourceFile);
            // try to open the file and find the property line if possible
            try {
                const doc = await vscode.workspace.openTextDocument(uri);
                for (let i = 0; i < doc.lineCount; i++) {
                    const line = doc.lineAt(i).text;
                    // CSV lines typically contain the property name in the first column
                    if (line.match(new RegExp("^\\s*" + objectName + "\\b"))) {
                        return new vscode.Location(uri, new vscode.Position(i, 0));
                    }
                }
            } catch (err) {
                // ignore
            }

            return new vscode.Location(uri, new vscode.Position(0, 0));
        }

        // Fall back to global lib symbols
        const gsym = cache.getGlobalSymbol(objectName);
        if (gsym) {
            const uri = vscode.Uri.file(gsym.sourceFile);
            return new vscode.Location(uri, new vscode.Position(0, 0));
        }

        return undefined;
    }
}