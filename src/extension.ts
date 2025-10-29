// src/extension.ts
import * as vscode from "vscode";
import { EcmaLanguageServer } from "./language_server";

export function activate(context: vscode.ExtensionContext) {
    console.log("ECMA 2 DSL extension is now active");

    // Initialize language server
    const languageServer = new EcmaLanguageServer();

    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: "file", language: "hwscript" },
        {
            provideCompletionItems(document, position, token, context) {
                return languageServer.provideCompletionItems(
                    document,
                    position
                );
            },
        },
        ".", // Trigger characters
        ":"
    );

    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider(
        { scheme: "file", language: "hwscript" },
        {
            provideHover(document, position, token) {
                return languageServer.provideHover(document, position);
            },
        }
    );

    // Register diagnostic provider
    const diagnosticCollection =
        vscode.languages.createDiagnosticCollection("hwscript");
    context.subscriptions.push(diagnosticCollection);

    // Update diagnostics on document change
    const diagnosticProvider = vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (event.document.languageId === "hwscript") {
                const diagnostics = languageServer.provideDiagnostics(
                    event.document
                );
                diagnosticCollection.set(event.document.uri, diagnostics);
            }
        }
    );

    // Update diagnostics on document open
    const diagnosticOnOpen = vscode.workspace.onDidOpenTextDocument(
        (document) => {
            if (document.languageId === "hwscript") {
                const diagnostics = languageServer.provideDiagnostics(document);
                diagnosticCollection.set(document.uri, diagnostics);
            }
        }
    );

    // Register definition provider (Go to Definition)
    const definitionProvider = vscode.languages.registerDefinitionProvider(
        { scheme: "file", language: "hwscript" },
        {
            provideDefinition(document, position, token) {
                return languageServer.provideDefinition(document, position);
            },
        }
    );

    // Register document symbol provider (Outline)
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(
        { scheme: "file", language: "hwscript" },
        {
            provideDocumentSymbols(document, token) {
                return languageServer.provideDocumentSymbols(document);
            },
        }
    );

    context.subscriptions.push(
        completionProvider,
        hoverProvider,
        diagnosticProvider,
        diagnosticOnOpen,
        definitionProvider,
        symbolProvider
    );
}

export function deactivate() {
    console.log("ECMA 2 DSL extension is now deactivated");
}
