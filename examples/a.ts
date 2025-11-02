import * as vscode from "vscode";

// Store dynamically discovered properties
interface PropertyInfo {
    name: string;
    type: string;
    documentation?: string;
    sourceFile?: string;
}

class CommonObjectTracker {
    private properties: Map<string, PropertyInfo> = new Map();
    private disposables: vscode.Disposable[] = [];

    constructor() {
        // Initialize with built-in properties
        this.initializeBuiltInProperties();

        // Scan all open documents on startup
        this.scanAllDocuments();

        // Watch for document changes
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument((event) => {
                this.scanDocument(event.document);
            })
        );

        // Watch for newly opened documents
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument((document) => {
                this.scanDocument(document);
            })
        );
    }

    private initializeBuiltInProperties() {
        // Add your predefined Common object properties
        const builtInProps: PropertyInfo[] = [
            {
                name: "Log",
                type: "function",
                documentation: "Logs content to console",
            },
            {
                name: "Beep",
                type: "function",
                documentation: "Makes a beep sound",
            },
            {
                name: "logger",
                type: "object",
                documentation: "Logger utility object",
            },
        ];

        builtInProps.forEach((prop) => {
            this.properties.set(prop.name, prop);
        });
    }

    private scanAllDocuments() {
        vscode.workspace.textDocuments.forEach((doc) => {
            if (
                doc.languageId === "javascript" ||
                doc.languageId === "typescript"
            ) {
                this.scanDocument(doc);
            }
        });
    }

    private scanDocument(document: vscode.TextDocument) {
        if (
            document.languageId !== "javascript" &&
            document.languageId !== "typescript"
        ) {
            return;
        }

        const text = document.getText();

        // Regex patterns to match Common assignments (including multiline)
        const patterns = [
            // Common.propertyName = value (supports multiline objects/arrays)
            /Common\.(\w+)\s*=\s*((?:[^;]|[\r\n])+?);/g,
            // Common["propertyName"] = value
            /Common\["(\w+)"\]\s*=\s*((?:[^;]|[\r\n])+?);/g,
            // Common['propertyName'] = value
            /Common\['(\w+)'\]\s*=\s*((?:[^;]|[\r\n])+?);/g,
        ];

        patterns.forEach((pattern) => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const propertyName = match[1];
                const value = match[2].trim();

                // Determine type from value
                const type = this.inferType(value);

                this.properties.set(propertyName, {
                    name: propertyName,
                    type: type,
                    documentation: `Dynamically assigned in ${document.fileName}`,
                    sourceFile: document.fileName,
                });
            }
        });
    }

    private inferType(value: string): string {
        value = value.trim();

        if (
            value.startsWith("function") ||
            value.startsWith("(") ||
            value.includes("=>")
        ) {
            return "function";
        } else if (value.startsWith("{")) {
            return "object";
        } else if (value.startsWith("[")) {
            return "array";
        } else if (
            value.startsWith('"') ||
            value.startsWith("'") ||
            value.startsWith("`")
        ) {
            return "string";
        } else if (!isNaN(Number(value))) {
            return "number";
        } else if (value === "true" || value === "false") {
            return "boolean";
        }

        return "any";
    }

    getProperties(): PropertyInfo[] {
        return Array.from(this.properties.values());
    }

    getProperty(name: string): PropertyInfo | undefined {
        return this.properties.get(name);
    }

    dispose() {
        this.disposables.forEach((d) => d.dispose());
    }
}

class CommonCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private tracker: CommonObjectTracker) {}

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.CompletionItem[] {
        const linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);

        // Check if we're typing after "Common."
        if (!linePrefix.endsWith("Common.")) {
            return [];
        }

        const properties = this.tracker.getProperties();

        return properties.map((prop) => {
            const item = new vscode.CompletionItem(
                prop.name,
                this.getCompletionItemKind(prop.type)
            );

            item.detail = prop.type;
            item.documentation = new vscode.MarkdownString(
                prop.documentation || `Property of type ${prop.type}`
            );

            if (prop.sourceFile) {
                item.documentation.appendMarkdown(
                    `\n\n---\n*Defined in: ${prop.sourceFile}*`
                );
            }

            // Add insert text for functions
            if (prop.type === "function") {
                item.insertText = new vscode.SnippetString(`${prop.name}($1)`);
            }

            return item;
        });
    }

    private getCompletionItemKind(type: string): vscode.CompletionItemKind {
        switch (type) {
            case "function":
                return vscode.CompletionItemKind.Function;
            case "object":
                return vscode.CompletionItemKind.Class;
            case "string":
                return vscode.CompletionItemKind.Value;
            case "number":
                return vscode.CompletionItemKind.Value;
            case "boolean":
                return vscode.CompletionItemKind.Value;
            case "array":
                return vscode.CompletionItemKind.Variable;
            default:
                return vscode.CompletionItemKind.Property;
        }
    }
}

class CommonHoverProvider implements vscode.HoverProvider {
    constructor(private tracker: CommonObjectTracker) {}

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);

        // Check if we're hovering over a property after "Common."
        const lineText = document.lineAt(position.line).text;
        const beforeWord = lineText.substring(0, range.start.character);

        if (!beforeWord.endsWith("Common.")) {
            return null;
        }

        const property = this.tracker.getProperty(word);
        if (!property) {
            return null;
        }

        const markdown = new vscode.MarkdownString();
        markdown.appendCodeblock(
            `Common.${property.name}: ${property.type}`,
            "typescript"
        );

        if (property.documentation) {
            markdown.appendMarkdown(`\n\n${property.documentation}`);
        }

        if (property.sourceFile) {
            markdown.appendMarkdown(
                `\n\n---\n*Source: ${property.sourceFile}*`
            );
        }

        return new vscode.Hover(markdown);
    }
}

class CommonDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private tracker: CommonObjectTracker) {}

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        const lineText = document.lineAt(position.line).text;
        const beforeWord = lineText.substring(0, range.start.character);

        if (!beforeWord.endsWith("Common.")) {
            return null;
        }

        const property = this.tracker.getProperty(word);
        if (!property || !property.sourceFile) {
            return null;
        }

        // Find the definition location in the source file
        return this.findDefinitionInFile(property);
    }

    private async findDefinitionInFile(
        property: PropertyInfo
    ): Promise<vscode.Location | null> {
        if (!property.sourceFile) {
            return null;
        }

        const uri = vscode.Uri.file(property.sourceFile);

        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const text = document.getText();

            const pattern = new RegExp(
                `Common\\.(${property.name}|\\["${property.name}"\\]|\\['${property.name}'\\])\\s*=`,
                "g"
            );

            const match = pattern.exec(text);
            if (match) {
                const position = document.positionAt(match.index);
                return new vscode.Location(uri, position);
            }
        } catch (error) {
            console.error("Error finding definition:", error);
        }

        return null;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log("Common Object IntelliSense extension activated");

    const tracker = new CommonObjectTracker();

    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        ["javascript", "typescript"],
        new CommonCompletionProvider(tracker),
        "." // Trigger on dot
    );

    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider(
        ["javascript", "typescript"],
        new CommonHoverProvider(tracker)
    );

    // Register definition provider (Go to Definition)
    const definitionProvider = vscode.languages.registerDefinitionProvider(
        ["javascript", "typescript"],
        new CommonDefinitionProvider(tracker)
    );

    // Add command to refresh Common object properties
    const refreshCommand = vscode.commands.registerCommand(
        "extension.refreshCommonProperties",
        () => {
            vscode.window.showInformationMessage(
                "Refreshing Common object properties..."
            );
            // Tracker automatically updates on document changes
        }
    );

    context.subscriptions.push(
        tracker,
        completionProvider,
        hoverProvider,
        definitionProvider,
        refreshCommand
    );
}

export function deactivate() {
    console.log("Common Object IntelliSense extension deactivated");
}
