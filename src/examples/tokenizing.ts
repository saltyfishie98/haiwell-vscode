// src/extension.ts - Main extension file with scoping support

import * as vscode from "vscode";

// Token types
enum TokenType {
    Keyword = "keyword",
    Identifier = "identifier",
    Number = "number",
    String = "string",
    Operator = "operator",
    Whitespace = "whitespace",
    Comment = "comment",
}

interface Token {
    type: TokenType;
    value: string;
    start: number;
    end: number;
}

interface SymbolInfo {
    name: string;
    kind: vscode.CompletionItemKind;
    detail: string;
    documentation: string;
    position: number;
    scopeId: number;
}

enum ScopeType {
    Global = "global",
    Function = "function",
    Block = "block",
    Class = "class",
}

interface Scope {
    id: number;
    type: ScopeType;
    parentId: number | null;
    start: number;
    end: number;
    symbols: Map<string, SymbolInfo>;
}

// hwscript tokenizer
class JSTokenizer {
    private text: string;
    private pos: number;
    private tokens: Token[];
    private readonly keywords = [
        "function",
        "const",
        "let",
        "var",
        "class",
        "if",
        "else",
        "return",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "break",
        "continue",
        "try",
        "catch",
        "finally",
        "throw",
        "new",
        "this",
        "super",
        "extends",
        "import",
        "export",
        "default",
        "async",
        "await",
        "yield",
        "typeof",
        "instanceof",
    ];

    constructor(text: string) {
        this.text = text;
        this.pos = 0;
        this.tokens = [];
    }

    tokenize(): Token[] {
        while (this.pos < this.text.length) {
            // Skip whitespace
            if (this.isWhitespace()) {
                this.pos++;
                continue;
            }

            // Single-line comments
            if (this.peek() === "/" && this.peek(1) === "/") {
                this.skipLineComment();
                continue;
            }

            // Multi-line comments
            if (this.peek() === "/" && this.peek(1) === "*") {
                this.skipBlockComment();
                continue;
            }

            // Identifiers and keywords
            if (this.isIdentifierStart()) {
                this.readIdentifier();
                continue;
            }

            // Numbers
            if (this.isDigit()) {
                this.readNumber();
                continue;
            }

            // Strings
            if (this.isQuote()) {
                this.readString();
                continue;
            }

            // Operators and punctuation
            this.readOperator();
        }

        return this.tokens;
    }

    private peek(offset: number = 0): string {
        return this.text[this.pos + offset] || "";
    }

    private isWhitespace(): boolean {
        return /\s/.test(this.peek());
    }

    private isIdentifierStart(): boolean {
        return /[a-zA-Z_$]/.test(this.peek());
    }

    private isIdentifierPart(): boolean {
        return /[a-zA-Z0-9_$]/.test(this.peek());
    }

    private isDigit(): boolean {
        return /[0-9]/.test(this.peek());
    }

    private isQuote(): boolean {
        const char = this.peek();
        return char === '"' || char === "'" || char === "`";
    }

    private skipLineComment(): void {
        while (this.pos < this.text.length && this.peek() !== "\n") {
            this.pos++;
        }
    }

    private skipBlockComment(): void {
        this.pos += 2; // Skip /*
        while (this.pos < this.text.length - 1) {
            if (this.peek() === "*" && this.peek(1) === "/") {
                this.pos += 2;
                break;
            }
            this.pos++;
        }
    }

    private readIdentifier(): void {
        const start = this.pos;
        while (this.isIdentifierPart()) {
            this.pos++;
        }
        const value = this.text.substring(start, this.pos);
        const type = this.keywords.includes(value)
            ? TokenType.Keyword
            : TokenType.Identifier;
        this.tokens.push({ type, value, start, end: this.pos });
    }

    private readNumber(): void {
        const start = this.pos;
        while (this.isDigit() || this.peek() === ".") {
            this.pos++;
        }
        // Handle scientific notation
        if (this.peek() === "e" || this.peek() === "E") {
            this.pos++;
            if (this.peek() === "+" || this.peek() === "-") {
                this.pos++;
            }
            while (this.isDigit()) {
                this.pos++;
            }
        }
        this.tokens.push({
            type: TokenType.Number,
            value: this.text.substring(start, this.pos),
            start,
            end: this.pos,
        });
    }

    private readString(): void {
        const quote = this.peek();
        const start = this.pos;
        this.pos++; // Skip opening quote

        while (this.pos < this.text.length && this.peek() !== quote) {
            if (this.peek() === "\\") {
                this.pos += 2; // Skip escaped character
            } else {
                this.pos++;
            }
        }

        if (this.peek() === quote) {
            this.pos++; // Skip closing quote
        }

        this.tokens.push({
            type: TokenType.String,
            value: this.text.substring(start, this.pos),
            start,
            end: this.pos,
        });
    }

    private readOperator(): void {
        const start = this.pos;
        const char = this.peek();
        this.pos++;
        this.tokens.push({
            type: TokenType.Operator,
            value: char,
            start,
            end: this.pos,
        });
    }
}

// Scope-aware symbol extractor
class ScopeAwareExtractor {
    private tokens: Token[];
    private scopes: Map<number, Scope>;
    private pos: number;
    private currentScopeId: number;
    private scopeIdCounter: number;
    private scopeStack: number[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.scopes = new Map();
        this.pos = 0;
        this.scopeIdCounter = 0;
        this.scopeStack = [];

        // Create global scope
        this.currentScopeId = this.createScope(
            ScopeType.Global,
            null,
            0,
            Infinity
        );
    }

    extract(): Map<number, Scope> {
        this.parseProgram();
        return this.scopes;
    }

    private createScope(
        type: ScopeType,
        parentId: number | null,
        start: number,
        end: number
    ): number {
        const id = this.scopeIdCounter++;
        this.scopes.set(id, {
            id,
            type,
            parentId,
            start,
            end,
            symbols: new Map(),
        });
        return id;
    }

    private enterScope(type: ScopeType, start: number): number {
        const newScopeId = this.createScope(
            type,
            this.currentScopeId,
            start,
            Infinity
        );
        this.scopeStack.push(this.currentScopeId);
        this.currentScopeId = newScopeId;
        return newScopeId;
    }

    private exitScope(end: number): void {
        const scope = this.scopes.get(this.currentScopeId);
        if (scope) {
            scope.end = end;
        }
        const parent = this.scopeStack.pop();
        if (parent !== undefined) {
            this.currentScopeId = parent;
        }
    }

    private addSymbol(name: string, info: Omit<SymbolInfo, "scopeId">): void {
        const scope = this.scopes.get(this.currentScopeId);
        if (scope) {
            scope.symbols.set(name, { ...info, scopeId: this.currentScopeId });
        }
    }

    private current(): Token | undefined {
        return this.tokens[this.pos];
    }

    private peek(offset: number = 1): Token | undefined {
        return this.tokens[this.pos + offset];
    }

    private match(value: string): boolean {
        return this.current()?.value === value;
    }

    private consume(): Token | undefined {
        return this.tokens[this.pos++];
    }

    private parseProgram(): void {
        while (this.pos < this.tokens.length) {
            this.parseStatement();
        }
    }

    private parseStatement(): void {
        const token = this.current();
        if (!token) {
            this.pos++;
            return;
        }

        if (token.type === TokenType.Keyword) {
            switch (token.value) {
                case "function":
                    this.parseFunctionDeclaration();
                    return;
                case "const":
                case "let":
                case "var":
                    this.parseVariableDeclaration(token.value);
                    return;
                case "class":
                    this.parseClassDeclaration();
                    return;
                case "if":
                    this.parseIfStatement();
                    return;
                case "for":
                case "while":
                    this.parseLoopStatement();
                    return;
                case "try":
                    this.parseTryStatement();
                    return;
            }
        }

        if (this.match("{")) {
            this.parseBlockStatement();
            return;
        }

        this.pos++;
    }

    private parseFunctionDeclaration(): void {
        this.consume(); // 'function'
        const nameToken = this.current();

        if (nameToken && nameToken.type === TokenType.Identifier) {
            this.addSymbol(nameToken.value, {
                name: nameToken.value,
                kind: vscode.CompletionItemKind.Function,
                detail: "function",
                documentation: `Function: ${nameToken.value}()`,
                position: nameToken.start,
            });
            this.consume(); // name
        }

        // Find function body
        while (this.current() && !this.match("{")) {
            this.pos++;
        }

        if (this.match("{")) {
            const start = this.current()!.start;
            this.enterScope(ScopeType.Function, start);
            this.consume(); // '{'

            let depth = 1;
            while (this.current() && depth > 0) {
                if (this.match("{")) {
                    depth++;
                    this.pos++;
                } else if (this.match("}")) {
                    depth--;
                    if (depth > 0) {
                        this.pos++;
                    }
                } else {
                    this.parseStatement();
                }
            }

            const end = this.current()?.end || start;
            this.consume(); // '}'
            this.exitScope(end);
        }
    }

    private parseVariableDeclaration(keyword: string): void {
        this.consume(); // keyword
        const nameToken = this.current();

        if (nameToken && nameToken.type === TokenType.Identifier) {
            const nextToken = this.peek();
            let kind = vscode.CompletionItemKind.Variable;

            // Check for function expression
            if (nextToken?.value === "=") {
                let checkPos = this.pos + 2;
                const valueToken = this.tokens[checkPos];
                if (
                    valueToken?.value === "function" ||
                    valueToken?.value === "async"
                ) {
                    kind = vscode.CompletionItemKind.Function;
                }
                // Check for arrow function
                while (
                    checkPos < this.tokens.length &&
                    this.tokens[checkPos].value !== ";"
                ) {
                    if (this.tokens[checkPos].value === "=>") {
                        kind = vscode.CompletionItemKind.Function;
                        break;
                    }
                    checkPos++;
                }
            }

            this.addSymbol(nameToken.value, {
                name: nameToken.value,
                kind,
                detail: keyword,
                documentation: `${keyword} ${nameToken.value}`,
                position: nameToken.start,
            });
            this.consume(); // name
        }

        // Parse initializer
        while (this.current() && !this.match(";") && !this.match(",")) {
            if (this.match("{")) {
                this.parseBlockStatement();
            } else {
                this.pos++;
            }
        }
    }

    private parseClassDeclaration(): void {
        this.consume(); // 'class'
        const nameToken = this.current();

        if (nameToken && nameToken.type === TokenType.Identifier) {
            this.addSymbol(nameToken.value, {
                name: nameToken.value,
                kind: vscode.CompletionItemKind.Class,
                detail: "class",
                documentation: `Class: ${nameToken.value}`,
                position: nameToken.start,
            });
            this.consume(); // name
        }

        // Find class body
        while (this.current() && !this.match("{")) {
            this.pos++;
        }

        if (this.match("{")) {
            const start = this.current()!.start;
            this.enterScope(ScopeType.Class, start);
            this.consume(); // '{'

            let depth = 1;
            while (this.current() && depth > 0) {
                if (this.match("{")) {
                    depth++;
                    this.pos++;
                } else if (this.match("}")) {
                    depth--;
                    if (depth > 0) {
                        this.pos++;
                    }
                } else {
                    this.parseStatement();
                }
            }

            const end = this.current()?.end || start;
            this.consume(); // '}'
            this.exitScope(end);
        }
    }

    private parseBlockStatement(): void {
        if (!this.match("{")) {
            return;
        }

        const start = this.current()!.start;
        const scopeId = this.enterScope(ScopeType.Block, start);
        this.consume(); // '{'

        let depth = 1;
        while (this.current() && depth > 0) {
            if (this.match("{")) {
                depth++;
                this.pos++;
            } else if (this.match("}")) {
                depth--;
                if (depth > 0) {
                    this.pos++;
                }
            } else {
                this.parseStatement();
            }
        }

        const end = this.current()?.end || start;
        this.consume(); // '}'
        this.exitScope(end);
    }

    private parseIfStatement(): void {
        this.consume(); // 'if'

        // Skip condition
        while (this.current() && !this.match("{")) {
            this.pos++;
        }

        // Parse then branch
        if (this.match("{")) {
            this.parseBlockStatement();
        } else {
            this.parseStatement();
        }

        // Parse else branch
        if (this.current()?.value === "else") {
            this.consume(); // 'else'
            if (this.match("{")) {
                this.parseBlockStatement();
            } else {
                this.parseStatement();
            }
        }
    }

    private parseLoopStatement(): void {
        this.consume(); // 'for'/'while'

        // Skip condition/init
        while (this.current() && !this.match("{")) {
            this.pos++;
        }

        // Parse body
        if (this.match("{")) {
            this.parseBlockStatement();
        } else {
            this.parseStatement();
        }
    }

    private parseTryStatement(): void {
        this.consume(); // 'try'

        if (this.match("{")) {
            this.parseBlockStatement();
        }

        // Parse catch
        if (this.current()?.value === "catch") {
            this.consume(); // 'catch'
            // Skip parameter
            while (this.current() && !this.match("{")) {
                this.pos++;
            }
            if (this.match("{")) {
                this.parseBlockStatement();
            }
        }

        // Parse finally
        if (this.current()?.value === "finally") {
            this.consume(); // 'finally'
            if (this.match("{")) {
                this.parseBlockStatement();
            }
        }
    }
}

// Document cache with scope information
interface CachedDocument {
    tokens: Token[];
    scopes: Map<number, Scope>;
    version: number;
}

class DocumentCache {
    private cache: Map<string, CachedDocument> = new Map();

    update(document: vscode.TextDocument): CachedDocument {
        const text = document.getText();
        const tokenizer = new JSTokenizer(text);
        const tokens = tokenizer.tokenize();
        const extractor = new ScopeAwareExtractor(tokens);
        const scopes = extractor.extract();

        const cached: CachedDocument = {
            tokens,
            scopes,
            version: document.version,
        };
        this.cache.set(document.uri.toString(), cached);
        return cached;
    }

    get(document: vscode.TextDocument): CachedDocument {
        const key = document.uri.toString();
        const cached = this.cache.get(key);

        if (cached && cached.version === document.version) {
            return cached;
        }

        return this.update(document);
    }

    clear(uri: vscode.Uri): void {
        this.cache.delete(uri.toString());
    }

    getScopeAtPosition(
        document: vscode.TextDocument,
        position: number
    ): Scope | null {
        const cached = this.get(document);
        let deepestScope: Scope | null = null;
        let deepestDepth = -1;

        for (const scope of cached.scopes.values()) {
            if (position >= scope.start && position <= scope.end) {
                let depth = 0;
                let current: Scope | undefined = scope;
                while (current?.parentId !== null) {
                    depth++;
                    current = cached.scopes.get(current!.parentId);
                }
                if (depth > deepestDepth) {
                    deepestScope = scope;
                    deepestDepth = depth;
                }
            }
        }

        return deepestScope;
    }

    getVisibleSymbols(
        document: vscode.TextDocument,
        position: number
    ): Map<string, SymbolInfo> {
        const cached = this.get(document);
        const currentScope = this.getScopeAtPosition(document, position);
        const visibleSymbols = new Map<string, SymbolInfo>();

        if (!currentScope) {
            return visibleSymbols;
        }

        // Walk up the scope chain
        let scope: Scope | undefined = currentScope;
        while (scope) {
            for (const [name, symbol] of scope.symbols) {
                if (!visibleSymbols.has(name)) {
                    visibleSymbols.set(name, symbol);
                }
            }
            scope =
                scope.parentId !== null
                    ? cached.scopes.get(scope.parentId)
                    : undefined;
        }

        return visibleSymbols;
    }
}

// Completion provider with scope awareness
class JSCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private cache: DocumentCache) {}

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] {
        const offset = document.offsetAt(position);
        const visibleSymbols = this.cache.getVisibleSymbols(document, offset);
        const items: vscode.CompletionItem[] = [];

        // Add visible symbols based on scope
        for (const [name, info] of visibleSymbols) {
            const item = new vscode.CompletionItem(name, info.kind);
            item.detail = info.detail;
            item.documentation = new vscode.MarkdownString(info.documentation);
            items.push(item);
        }

        // Add globals (always visible)
        const globals = [
            {
                name: "console",
                kind: vscode.CompletionItemKind.Variable,
                detail: "Console object",
            },
            {
                name: "document",
                kind: vscode.CompletionItemKind.Variable,
                detail: "Document object",
            },
            {
                name: "window",
                kind: vscode.CompletionItemKind.Variable,
                detail: "Window object",
            },
            {
                name: "Array",
                kind: vscode.CompletionItemKind.Class,
                detail: "Array constructor",
            },
            {
                name: "Object",
                kind: vscode.CompletionItemKind.Class,
                detail: "Object constructor",
            },
            {
                name: "String",
                kind: vscode.CompletionItemKind.Class,
                detail: "String constructor",
            },
            {
                name: "Number",
                kind: vscode.CompletionItemKind.Class,
                detail: "Number constructor",
            },
            {
                name: "Boolean",
                kind: vscode.CompletionItemKind.Class,
                detail: "Boolean constructor",
            },
            {
                name: "Promise",
                kind: vscode.CompletionItemKind.Class,
                detail: "Promise constructor",
            },
        ];

        for (const g of globals) {
            const item = new vscode.CompletionItem(g.name, g.kind);
            item.detail = g.detail;
            items.push(item);
        }

        return items;
    }
}

// Hover provider with scope information
class JSHoverProvider implements vscode.HoverProvider {
    constructor(private cache: DocumentCache) {}

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Hover | null {
        const offset = document.offsetAt(position);
        const visibleSymbols = this.cache.getVisibleSymbols(document, offset);
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        const symbol = visibleSymbols.get(word);

        if (symbol) {
            const cached = this.cache.get(document);
            const scope = cached.scopes.get(symbol.scopeId);
            const scopeInfo = scope ? `(${scope.type} scope)` : "";

            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(symbol.name, "hwscript");
            markdown.appendMarkdown(
                `\n**${symbol.detail}** ${scopeInfo}\n\n${symbol.documentation}`
            );
            return new vscode.Hover(markdown);
        }

        return null;
    }
}

// Definition provider with scope awareness
class JSDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private cache: DocumentCache) {}

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | null {
        const offset = document.offsetAt(position);
        const visibleSymbols = this.cache.getVisibleSymbols(document, offset);
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        const symbol = visibleSymbols.get(word);

        if (symbol) {
            const pos = document.positionAt(symbol.position);
            return new vscode.Location(document.uri, pos);
        }

        return null;
    }
}

// Activation
export function activate(context: vscode.ExtensionContext): void {
    console.log("Scope-aware hwscript IntelliSense extension activated");

    const documentCache = new DocumentCache();
    const selector: vscode.DocumentSelector = {
        scheme: "file",
        language: "hwscript",
    };

    // Update cache on document changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.languageId === "hwscript") {
                documentCache.update(event.document);
            }
        })
    );

    // Clear cache on document close
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((document) => {
            documentCache.clear(document.uri);
        })
    );

    // Register providers
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            selector,
            new JSCompletionProvider(documentCache),
            ".",
            " "
        )
    );

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            selector,
            new JSHoverProvider(documentCache)
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            selector,
            new JSDefinitionProvider(documentCache)
        )
    );
}

export function deactivate(): void {}
