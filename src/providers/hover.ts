import * as vscode from "vscode";
import * as path from "path";
import { ProjectObjectCache } from "../project_object_cache";
import { BUILTIN_OBJ } from "../predefined";

export class HaiwellScriptHoverProvider implements vscode.HoverProvider {
    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        const range = document.getWordRangeAtPosition(
            position,
            /\$\w+(\.\w+)?/
        );
        if (!range) {
            // fallback: bare identifier that may be a global symbol from lib
            const wordRange = document.getWordRangeAtPosition(
                position,
                /\b[A-Za-z_][A-Za-z0-9_]*\b/
            );
            if (!wordRange) {
                return undefined;
            }

            const name = document.getText(wordRange);
            const g = ProjectObjectCache.getInstance().getGlobalSymbol(name);
            if (g) {
                const md = new vscode.MarkdownString();
                md.appendCodeblock(name, "hwscript");
                md.appendMarkdown(
                    `\n\nDefined in: \`${path.basename(g.sourceFile)}\``
                );
                return new vscode.Hover(md, wordRange);
            }

            return undefined;
        }

        const text = document.getText(range);
        const match = text.match(/\$(\w+)(?:\.(\w+))?/);
        if (!match) {
            return undefined;
        }

        const objectName = match[1];
        const propertyName = match[2];
        const cache = ProjectObjectCache.getInstance();
        const markdown = new vscode.MarkdownString();
        markdown.isTrusted = true;

        if (propertyName) {
            markdown.appendCodeblock(
                `$${objectName}.${propertyName}`,
                "hwscript"
            );
            const properties = cache.getObjectProperties(objectName);
            const prop = properties.find((p) => p.name === propertyName);
            if (prop) {
                markdown.appendMarkdown(`\n\nType: \`${prop.type.id}\``);
                if (
                    prop.type.id === "String" &&
                    prop.type.value_len !== undefined
                ) {
                    markdown.appendMarkdown(
                        `\n\nString length: **${prop.type.value_len}**`
                    );
                }
                if (prop.description) {
                    markdown.appendMarkdown(`\n\n${prop.description}`);
                }
            }
        } else {
            markdown.appendCodeblock(`$${objectName}`, "hwscript");
            const definition = cache.getUserVariableGroup(objectName);
            if (definition) {
                markdown.appendMarkdown(
                    `\n\nDefined in: \`${path.basename(
                        definition.sourceFile
                    )}\``
                );
                markdown.appendMarkdown(`\n\n**Properties**:\n`);
                definition.properties.slice(0, 10).forEach((p) => {
                    markdown.appendMarkdown(`- \`${p.name}\`: ${p.type}\n`);
                });
            } else if (BUILTIN_OBJ[objectName]) {
                markdown.appendMarkdown(`\n\nPredefined object`);
            } else {
                markdown.appendMarkdown(`\n\n⚠️ Not defined`);
            }
        }

        return new vscode.Hover(markdown, range);
    }
}
