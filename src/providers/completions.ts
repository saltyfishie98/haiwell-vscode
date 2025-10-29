import * as vscode from "vscode";
import * as path from "path";
import {
    PREDEFINED_OBJECT_PROPERTY_MAP,
    PREDEFINED_VARIABLES,
} from "../predefined";
import { ProjectObjectCache } from "../project_object_cache";
import { PropertyInfo } from "../types";

export class HaiwellScriptCompletionProvider
    implements vscode.CompletionItemProvider
{
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[] | vscode.CompletionList | undefined> {
        const linePrefix = document
            .lineAt(position)
            .text.substring(0, position.character);

        const dot = linePrefix.match(/(\w+)\.$/);
        if (dot) {
            const objectName = dot[1];
            const items = await this.getPropertyCompletions(
                objectName,
                document
            );
            return items.length > 0
                ? new vscode.CompletionList(items, false)
                : undefined;
        }

        const items = await this.getObjectCompletions(document);
        return new vscode.CompletionList(items, false);
    }

    private async getObjectCompletions(
        document: vscode.TextDocument
    ): Promise<vscode.CompletionItem[]> {
        const completions: vscode.CompletionItem[] = [];
        const cache = ProjectObjectCache.getInstance();
        const definedObjects = cache.getDefinedObjects();
        const projectObjects = await cache.getProjectObjects();
        let addedObjects = new Set<string>();

        // Collect local variables and functions declared in the current document
        // and add them as high-priority completions (local context)
        try {
            const text = document.getText();
            const localVarRegex =
                /\b(?:var|let|const)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
            const localFuncRegex =
                /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;

            for (const match of text.matchAll(localVarRegex)) {
                const name = match[1];
                if (name && !addedObjects.has(name)) {
                    const item = new vscode.CompletionItem(
                        name,
                        vscode.CompletionItemKind.Variable
                    );
                    item.detail = `${name} (local variable)`;
                    item.insertText = name;
                    item.sortText = `0${name}`;
                    item.documentation = new vscode.MarkdownString(
                        `Local variable **${name}**`
                    );
                    completions.push(item);
                    addedObjects.add(name);
                }
            }

            for (const match of text.matchAll(localFuncRegex)) {
                const name = match[1];
                if (name && !addedObjects.has(name)) {
                    const item = new vscode.CompletionItem(
                        name,
                        vscode.CompletionItemKind.Function
                    );
                    item.detail = `${name} (local function)`;
                    item.insertText = name;
                    item.sortText = `0${name}`;
                    item.documentation = new vscode.MarkdownString(
                        `Local function **${name}()`
                    );
                    completions.push(item);
                    addedObjects.add(name);
                }
            }
        } catch (err) {
            console.error(
                "Error while collecting local symbols for completions:",
                err
            );
        }

        // Global symbols from lib/ (TS/JS exports)
        try {
            const globals = cache.getGlobalSymbols();
            for (const g of globals) {
                if (addedObjects.has(g.name)) {
                    continue;
                }

                const kind =
                    g.kind === "function"
                        ? vscode.CompletionItemKind.Function
                        : g.kind === "class"
                        ? vscode.CompletionItemKind.Class
                        : vscode.CompletionItemKind.Variable;

                const item = new vscode.CompletionItem(g.name, kind);
                item.detail = `${g.name} (global from lib)`;
                item.insertText = g.name;
                item.sortText = `0g${g.name}`;
                item.documentation = new vscode.MarkdownString(
                    `Defined in: \`${path.basename(g.sourceFile)}\``
                );
                completions.push(item);
                addedObjects.add(g.name);
            }
        } catch (err) {
            // ignore
        }

        // Predefined objects
        for (const objectName of Object.keys(PREDEFINED_OBJECT_PROPERTY_MAP)) {
            if (addedObjects.has(objectName)) {
                continue;
            }

            const properties = PREDEFINED_OBJECT_PROPERTY_MAP[objectName];
            const item = new vscode.CompletionItem(
                objectName,
                vscode.CompletionItemKind.Class
            );
            item.detail = `${objectName} (predefined)`;
            item.insertText = objectName;
            item.sortText = `1${objectName}`;

            const propPreview = properties
                .slice(0, 5)
                .map((p) => `${p.name}: ${p.type}`)
                .join(", ");
            item.documentation = new vscode.MarkdownString(
                `Predefined **${objectName}**\n\n**Properties**: ${propPreview}`
            );

            completions.push(item);
            addedObjects.add(objectName);
        }

        for (const [name, info] of Object.entries(PREDEFINED_VARIABLES)) {
            const varName = `\$${name.replace(/^_/, "")}`;

            if (addedObjects.has(varName)) {
                continue;
            }

            let doc;
            if (info.description) {
                doc =
                    `## ${varName}\n\n` +
                    `**haiwell type**: ${info.rawType}\n\n` +
                    `**description**: ${info.description}`;
            } else {
                doc =
                    `## ${varName}\n\n` +
                    `**haiwell type**: ${info.rawType}\n\n`;
            }

            const item = new vscode.CompletionItem(
                varName,
                vscode.CompletionItemKind.Constant
            );
            item.detail = `${varName} (system variable)`;
            item.insertText = varName;
            item.sortText = `2${varName}`;
            item.documentation = new vscode.MarkdownString(doc);

            completions.push(item);
        }

        // User defined objects
        for (const objectName of definedObjects) {
            if (addedObjects.has(objectName)) {
                continue;
            }

            const definition = cache.getObjectDefinition(objectName);
            if (!definition) {
                continue;
            }

            const item = new vscode.CompletionItem(
                `\$${objectName}`,
                vscode.CompletionItemKind.Class
            );
            item.detail = `${objectName} (defined)`;
            item.insertText = `\$${objectName}`;
            item.sortText = `1${objectName}`;

            const propPreview = definition.properties
                .slice(0, 5)
                .map((p) => `${p.name}: ${p.type}`)
                .join(", ");

            item.documentation = new vscode.MarkdownString(
                `**${objectName}**\n\nDefined in: \`${path.basename(
                    definition.sourceFile
                )}\`\n\n**Properties**: ${propPreview}`
            );

            completions.push(item);
            addedObjects.add(objectName);
        }

        addedObjects = new Set([
            ...addedObjects,
            ...Object.keys(PREDEFINED_VARIABLES),
        ]);

        // Used but undefined objects
        for (const [objectName, usage] of projectObjects.entries()) {
            if (addedObjects.has(objectName)) {
                continue;
            }

            const item = new vscode.CompletionItem(
                `\$${objectName}`,
                vscode.CompletionItemKind.Reference
            );
            item.detail = `${objectName} (⚠️ undefined)`;
            item.insertText = `\$${objectName}`;
            item.sortText = `3${objectName}`;

            item.documentation = new vscode.MarkdownString(
                `**${objectName}**\n\n⚠️ Not defined in variable directory`
            );

            completions.push(item);
        }

        return completions;
    }

    private async getPropertyCompletions(
        objectName: string,
        document: vscode.TextDocument
    ): Promise<vscode.CompletionItem[]> {
        // First look for local object literal properties in the current document
        const localProps = this.getLocalObjectProperties(objectName, document);

        const cache = ProjectObjectCache.getInstance();
        const cachedProps = cache.getObjectProperties(objectName);

        // Prefer local properties if available, otherwise fall back to cached/project definitions
        const properties = localProps.length > 0 ? localProps : cachedProps;

        if (properties.length === 0) {
            return [];
        }

        return properties.map((prop) => {
            const item = new vscode.CompletionItem(
                prop.name,
                vscode.CompletionItemKind.Property
            );
            item.detail = `${prop.name}: ${prop.type}`;
            item.insertText = prop.name;
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`**${prop.name}**  \n`);
            // md.appendMarkdown(`Type: \`${prop.type}\``);
            if (prop.rawType !== undefined) {
                md.appendMarkdown(`  \n\nHaiwell Type: **${prop.rawType}**`);
            }
            if (prop.type === "string" && prop.stringLength !== undefined) {
                md.appendMarkdown(
                    `  \n\nString length: **${prop.stringLength}**`
                );
            }
            if (prop.description) {
                md.appendMarkdown(`  \n\n${prop.description}`);
            }
            item.documentation = md;
            return item;
        });
    }

    private getLocalObjectProperties(
        objectName: string,
        document: vscode.TextDocument
    ): PropertyInfo[] {
        const props = new Set<string>();

        try {
            const text = document.getText();

            // Match var/let/const <name> = { ... }
            const varRegex = new RegExp(
                "\\b(?:var|let|const)\\s+" +
                    objectName +
                    "\\s*=\\s*\\{([\\s\\S]*?)\\}",
                "g"
            );

            // Match <name> = { ... } (assignment)
            const assignRegex = new RegExp(
                "\\b" + objectName + "\\s*=\\s*\\{([\\s\\S]*?)\\}",
                "g"
            );

            let match: RegExpExecArray | null;

            const extractProps = (body: string) => {
                // Match unquoted or quoted property keys followed by colon
                const keyRegex =
                    /(?:['"])?([A-Za-z_][A-Za-z0-9_]*)(?:['"])?\s*:/g;
                let m: RegExpExecArray | null;
                while ((m = keyRegex.exec(body)) !== null) {
                    props.add(m[1]);
                }
            };

            while ((match = varRegex.exec(text)) !== null) {
                extractProps(match[1]);
            }

            // Only attempt assignRegex if we didn't find via var/let/const
            if (props.size === 0) {
                while ((match = assignRegex.exec(text)) !== null) {
                    extractProps(match[1]);
                }
            }
        } catch (err) {
            console.error("Error extracting local object properties:", err);
        }

        return Array.from(props).map((name) => ({ name, type: "any" }));
    }
}
