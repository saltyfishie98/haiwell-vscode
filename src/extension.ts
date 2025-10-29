import * as vscode from "vscode";
import { ProjectObjectCache } from "./project_object_cache";
import { HaiwellScriptCompletionProvider } from "./providers/completions";
import { HaiwellScriptHoverProvider } from "./providers/hover";
import { HaiwellScriptDefinitionProvider } from "./providers/definition";
import { HaiwellScriptDocumentSymbolProvider } from "./providers/document_symbol";

export function activate(context: vscode.ExtensionContext): void {
    console.log("Haiwell Script extension is now active");

    const cache = ProjectObjectCache.getInstance();
    cache.initialize();

    const variableWatcher =
        vscode.workspace.createFileSystemWatcher("**/variable/*.csv");
    variableWatcher.onDidChange(() => cache.loadVariableDefinitions());
    variableWatcher.onDidCreate(() => cache.loadVariableDefinitions());
    variableWatcher.onDidDelete(() => cache.loadVariableDefinitions());

    const libWatcher = vscode.workspace.createFileSystemWatcher(
        "**/lib/**/*.{ts,js,csv}"
    );
    libWatcher.onDidChange(() => cache.loadLibDefinitions());
    libWatcher.onDidCreate(() => cache.loadLibDefinitions());
    libWatcher.onDidDelete(() => cache.loadLibDefinitions());

    const fileWatcher = vscode.workspace.createFileSystemWatcher(
        "**/*.{hws,hwscript}"
    );
    fileWatcher.onDidChange((uri) => {
        vscode.workspace.openTextDocument(uri).then((doc) => {
            cache.updateDocument(doc);
        });
    });
    fileWatcher.onDidCreate(() => cache.indexProject());
    fileWatcher.onDidDelete(() => cache.indexProject());

    const docChangeListener = vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (event.document.languageId === "hwscript") {
                cache.updateDocument(event.document);
            }
        }
    );

    const docSaveListener = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === "hwscript") {
            cache.updateDocument(document);
        }
    });

    const diagnosticCollection =
        vscode.languages.createDiagnosticCollection("hwscript");

    const validateDocument = (document: vscode.TextDocument) => {
        if (document.languageId !== "hwscript") {
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const dollarObjectPattern = /\$([A-Za-z_][A-Za-z0-9_]*)/g;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            let match: RegExpExecArray | null;

            while ((match = dollarObjectPattern.exec(line.text)) !== null) {
                const objectName = match[1];

                if (!cache.isObjectDefined(objectName)) {
                    const startPos = new vscode.Position(i, match.index);
                    const endPos = new vscode.Position(i, match.index + match[0].length);
                    const range = new vscode.Range(startPos, endPos);

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Object '$${objectName}' is not defined in variable directory`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.source = "hwscript";
                    diagnostics.push(diagnostic);
                }
            }
        }

        diagnosticCollection.set(document.uri, diagnostics);
    };

    vscode.workspace.onDidOpenTextDocument(validateDocument);
    vscode.workspace.onDidChangeTextDocument((e) => validateDocument(e.document));
    vscode.workspace.textDocuments.forEach(validateDocument);

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: "file", language: "hwscript" },
        new HaiwellScriptCompletionProvider(),
        "$",
        "."
    );

    console.log("Completion providers registered for hwscript language");

    const hoverProvider = vscode.languages.registerHoverProvider(
        "hwscript",
        new HaiwellScriptHoverProvider()
    );

    const definitionProvider = vscode.languages.registerDefinitionProvider(
        "hwscript",
        new HaiwellScriptDefinitionProvider()
    );

    const documentSymbolProvider =
        vscode.languages.registerDocumentSymbolProvider(
            "hwscript",
            new HaiwellScriptDocumentSymbolProvider()
        );

    const reindexCommand = vscode.commands.registerCommand(
        "hwscript.reindexProject",
        async () => {
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: "Indexing Haiwell Script project...",
                    cancellable: false,
                },
                async () => {
                    cache.clear();
                    await cache.initialize();
                    vscode.window.showInformationMessage(
                        "Haiwell Script project indexed successfully!"
                    );
                }
            );
        }
    );

    context.subscriptions.push(
        completionProvider,
        hoverProvider,
        definitionProvider,
        documentSymbolProvider,
        fileWatcher,
        variableWatcher,
        libWatcher,
        docChangeListener,
        docSaveListener,
        diagnosticCollection,
        reindexCommand
    );
}

export function deactivate(): void {
    ProjectObjectCache.getInstance().clear();
}



