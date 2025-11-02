// src/extension.ts - Main extension file with JSON object parsing

import { assert } from "console";
import * as vscode from "vscode";

type TypeId =
    | "string"
    | "number"
    | "object"
    | "function"
    | "boolean"
    | "any"
    | "null"
    | "array"
    | "undefined";

type TypeMetadata = {
    location?: string;
    description?: string;
};

type FunctionParam = {
    name: string;
    type: TypeId;
    metadata?: TypeMetadata;
};

type StringType = {
    id: "string";
    value_len?: number;
    metadata?: TypeMetadata;
};

type NumberType = { id: "number"; metadata?: TypeMetadata };

type FunctionType = {
    id: "function";
    params?: FunctionParam[];
    metadata?: TypeMetadata;
};

type BooleanType = { id: "boolean"; metadata?: TypeMetadata };

type AnyType = { id: "any"; metadata?: TypeMetadata };

type Undefined = {
    id: "undefined";
    str?: string;
    metadata?: TypeMetadata;
};

type NullType = {
    id: "null";
    metadata?: TypeMetadata;
};

type ObjectType = {
    id: "object";
    child?: Map<string, PropertyInfo>;
    metadata?: TypeMetadata;
};

type ArrayType = {
    id: "array";
    length: number;
    child?: PropertyInfo[];
    metadata?: TypeMetadata;
};

type ValueType =
    | StringType
    | NumberType
    | ObjectType
    | FunctionType
    | BooleanType
    | AnyType
    | NullType
    | ArrayType
    | Undefined;

const make_type = {
    Number: (metadata?: TypeMetadata): NumberType => ({
        id: "number",
        metadata: metadata,
    }),

    Boolean: (metadata?: TypeMetadata): BooleanType => ({
        id: "boolean",
        metadata: metadata,
    }),

    Any: (metadata?: TypeMetadata): AnyType => ({
        id: "any",
        metadata: metadata,
    }),

    Null: (metadata?: TypeMetadata): NullType => ({
        id: "null",
        metadata: metadata,
    }),

    Undefined: (str?: string, metadata?: TypeMetadata): ValueType => {
        return {
            id: "undefined",
            str: str,
            metadata: metadata,
        };
    },

    String: (length?: number, metadata?: TypeMetadata): ValueType => {
        return {
            id: "string",
            value_len: length,
            metadata: metadata,
        };
    },

    Array: (array?: ValueType[], metadata?: TypeMetadata): ValueType => {
        return {
            id: "array",
            length: array ? array.length : 0,
            child: array?.map((e) => {
                return {
                    type: e,
                    metadata: metadata,
                };
            }),
        };
    },

    Object: (
        child: { [key: string]: ValueType },
        metadata?: TypeMetadata
    ): ValueType => {
        const out = Object.entries(child).reduce((acc, [k, v]) => {
            acc.set(k, { type: v });
            return acc;
        }, new Map<string, PropertyInfo>());

        return {
            id: "object",
            child: out,
            metadata: metadata,
        };
    },

    Function: (params?: string[], metadata?: TypeMetadata): ValueType => {
        if (params === undefined || params.length === 0) {
            return { id: "function", metadata: metadata };
        }

        const p = params.map((p): FunctionParam => {
            let [n, t] = p.split(":");
            t = typeof t === "undefined" ? "any" : t.trim();
            n = n.trim();

            return {
                name: n,
                type: t as TypeId,
            };
        });

        return {
            id: "function",
            params: p,
            metadata: metadata,
        };
    },
};

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

interface PropertyInfo {
    type: ValueType;
    description?: string;
    rawType?: string;
    // optional source line in the CSV (1-based)
    sourceLine?: number;
    // optional human readable description from CSV
}

interface SymbolInfo {
    name: string;
    kind: vscode.CompletionItemKind;
    detail: string;
    documentation: string;
    position: number;
    scopeId: number;
    properties?: Map<string, PropertyInfo>; // For objects
}

enum ScopeType {
    Global = "global",
    Function = "function",
    Block = "block",
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
        "var",
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
        "default",
        "typeof",
        "instanceof",
        "null",
        "undefined",
        "true",
        "false",
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

// Scope-aware symbol extractor with JSON object parsing
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
                case "var":
                    this.parseVariableDeclaration(token.value);
                    return;
                case "if":
                    this.parseIfStatement();
                    return;
                case "for":
                case "while":
                    this.parseLoopStatement();
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
            let properties: Map<string, PropertyInfo> | undefined;

            // Check for assignment
            if (nextToken?.value === "=") {
                const savePos = this.pos;
                this.consume(); // name
                this.consume(); // '='

                const valueToken = this.current();

                // Check for function expression
                if (valueToken?.value === "function") {
                    kind = vscode.CompletionItemKind.Function;
                }
                // Check for object literal
                else if (valueToken?.value === "{") {
                    properties = this.parseObjectLiteral();
                    kind = vscode.CompletionItemKind.Struct;
                }
                // Check for arrow function
                else {
                    let checkPos = this.pos;
                    while (
                        checkPos < this.tokens.length &&
                        this.tokens[checkPos].value !== ";" &&
                        this.tokens[checkPos].value !== "," &&
                        !this.tokens[checkPos].value.match(/^[{]$/)
                    ) {
                        if (this.tokens[checkPos].value === "=>") {
                            kind = vscode.CompletionItemKind.Function;
                            break;
                        }
                        checkPos++;
                    }
                }

                this.pos = savePos;
            }

            this.addSymbol(nameToken.value, {
                name: nameToken.value,
                kind,
                detail:
                    kind === vscode.CompletionItemKind.Struct
                        ? `${keyword} (object)`
                        : keyword,
                documentation: properties
                    ? `${keyword} ${nameToken.value} with ${properties.size} properties`
                    : `${keyword} ${nameToken.value}`,
                position: nameToken.start,
                properties,
            });
            this.consume(); // name
        }

        // Parse initializer
        while (this.current() && !this.match(";") && !this.match(",")) {
            if (this.match("{")) {
                this.skipBalancedBraces();
            } else {
                this.pos++;
            }
        }
    }

    private parseObjectLiteral(): Map<string, PropertyInfo> {
        const make_prop = (valueToken?: Token): ValueType => {
            let propType;

            if (valueToken) {
                if (valueToken.type === TokenType.String) {
                    propType = make_type.String();
                } else if (valueToken.type === TokenType.Number) {
                    propType = make_type.Number();
                } else if (
                    valueToken.value === "true" ||
                    valueToken.value === "false"
                ) {
                    propType = make_type.Boolean();
                } else if (valueToken.value === "{") {
                    propType = make_type.Object({});
                } else if (valueToken.value === "[") {
                    propType = make_type.Array();
                } else if (valueToken.value === "function") {
                    propType = make_type.Function();
                } else if (valueToken.value === "null") {
                    propType = make_type.Null();
                } else if (valueToken.value === "undefined") {
                    propType = make_type.Undefined();
                } else {
                    // Check for arrow function
                    let checkPos = this.pos;
                    while (
                        checkPos < this.tokens.length &&
                        this.tokens[checkPos].value !== "," &&
                        this.tokens[checkPos].value !== "}"
                    ) {
                        if (this.tokens[checkPos].value === "=>") {
                            propType = make_type.Function();
                            break;
                        }
                        checkPos++;
                    }
                }
            }

            return propType ? propType : make_type.Any();
        };

        const properties = new Map<string, PropertyInfo>();

        if (!this.match("{")) {
            return properties;
        }

        this.consume(); // '{'

        while (this.current() && !this.match("}")) {
            const token = this.current();

            // Property name (identifier or string)
            if (
                token?.type === TokenType.Identifier ||
                token?.type === TokenType.String
            ) {
                const propName =
                    token.type === TokenType.String
                        ? token.value.slice(1, -1) // Remove quotes
                        : token.value;

                this.consume(); // property name

                // Skip optional whitespace and colon
                if (this.match(":")) {
                    this.consume(); // ':'

                    // Infer property type from value
                    const valueToken = this.current();
                    let propType = make_prop(valueToken);

                    // Skip to next property or end
                    let depth = 0;
                    let nest: [string, PropertyInfo][] = [];
                    while (
                        this.current() &&
                        !(depth === 0 && (this.match(",") || this.match("}")))
                    ) {
                        if (depth > 0 && !this.match("}")) {
                            let child;

                            switch (propType.id) {
                                case "array":
                                    child = !propType.child
                                        ? []
                                        : propType.child;

                                    const ty = make_prop(this.consume());

                                    if (ty) {
                                        child.push({
                                            type: ty,
                                        });

                                        propType.child = child;
                                        propType.length = child.length;
                                    }

                                    break;

                                case "object":
                                    child = !propType.child
                                        ? new Map<string, PropertyInfo>()
                                        : propType.child;

                                    const current = this.consume();

                                    if (
                                        current &&
                                        current.type === TokenType.Identifier
                                    ) {
                                        let name = current.value;

                                        if (this.peek()?.value === "{") {
                                            nest.push([
                                                name,
                                                {
                                                    type: make_type.Object({}),
                                                },
                                            ]);

                                            this.consume();
                                            break;
                                        }

                                        this.consume();
                                        const ty = make_prop(this.consume());

                                        if (ty.id === "function") {
                                            let param;
                                            while (
                                                (param = this.consume())
                                                    ?.value !== ")"
                                            ) {
                                                if (
                                                    param?.type !==
                                                    TokenType.Identifier
                                                ) {
                                                    continue;
                                                }

                                                ty.params = ty.params
                                                    ? ty.params
                                                    : [];

                                                ty.params.push({
                                                    name: param.value,
                                                    type: "any",
                                                });
                                            }

                                            let token;
                                            if (
                                                (token = this.consume())
                                                    ?.value === "{"
                                            ) {
                                                let level = 1;
                                                while (level > 0) {
                                                    token = this.consume();

                                                    if (token?.value === "{") {
                                                        ++level;
                                                    } else if (
                                                        token?.value === "}"
                                                    ) {
                                                        --level;
                                                    }
                                                }
                                            }

                                            this.current();
                                        }

                                        if (nest.length <= 0) {
                                            child.set(name, {
                                                type: ty,
                                            });
                                        } else {
                                            let [id, prop] = nest[depth - 2];

                                            if (
                                                !prop ||
                                                prop.type.id !== "object"
                                            ) {
                                                this.consume();
                                                break;
                                            }

                                            prop.type.child!.set(name, {
                                                type: ty,
                                            });
                                        }

                                        propType.child = child;
                                    } else {
                                        this.consume();
                                    }

                                    break;

                                case "function":
                                    child = !propType.params
                                        ? []
                                        : propType.params;

                                    if (child.length === 0) {
                                        this.consume();
                                    }

                                    let params = this.consume();
                                    if (
                                        params &&
                                        params.type === TokenType.Identifier
                                    ) {
                                        child.push({
                                            name: params.value,
                                            type: "any",
                                        });

                                        propType.params = child;
                                    }

                                    break;

                                default:
                                    break;
                            }
                        }

                        if (
                            (this.match("{") && propType.id !== "function") ||
                            this.match("[") ||
                            this.match("function")
                        ) {
                            depth++;
                        } else if (this.match("}") || this.match("]")) {
                            depth--;
                            const inner = nest.pop();

                            let upper;
                            if (
                                inner &&
                                (upper = nest.at(-1)) === undefined &&
                                propType.id === "object" &&
                                propType.child
                            ) {
                                propType.child.set(inner[0], inner[1]);
                            } else if (
                                inner &&
                                (upper = nest.at(-1)) !== undefined &&
                                upper[1].type.id === "object"
                            ) {
                                upper[1].type.child!.set(inner[0], inner[1]);
                            }

                            if (depth < 0) {
                                break;
                            }
                        }

                        this.consume();
                    }

                    properties.set(propName, {
                        type: propType,
                    });

                    if (this.match(",")) {
                        this.consume(); // ','
                    }
                }
            } else {
                this.pos++;
            }
        }

        return properties;
    }

    private skipBalancedBraces(): void {
        if (!this.match("{")) {
            return;
        }

        let depth = 1;
        this.consume(); // '{'

        while (this.current() && depth > 0) {
            if (this.match("{")) {
                depth++;
            } else if (this.match("}")) {
                depth--;
            }
            this.pos++;
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

// Completion provider with scope awareness and object property completion
class JSCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private cache: DocumentCache) {}

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] {
        const offset = document.offsetAt(position);
        const linePrefix = document
            .lineAt(position)
            .text.substring(0, position.character);

        // Check for member access (e.g., "obj.")
        const memberAccessMatch = linePrefix.match(/(\w+)\.(\w*)$/);

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

        if (memberAccessMatch) {
            const objectName = memberAccessMatch[1];
            return this.provideMemberCompletions(document, offset, objectName);
        }

        // Regular symbol completions
        const visibleSymbols = this.cache.getVisibleSymbols(document, offset);
        const items: vscode.CompletionItem[] = [];

        // Add visible symbols based on scope
        for (const [name, info] of visibleSymbols) {
            const item = new vscode.CompletionItem(name, info.kind);
            item.detail = info.detail;
            item.documentation = new vscode.MarkdownString(info.documentation);
            items.push(item);
        }

        for (const g of globals) {
            const item = new vscode.CompletionItem(g.name, g.kind);
            item.detail = g.detail;
            items.push(item);
        }

        return items;
    }

    private provideMemberCompletions(
        document: vscode.TextDocument,
        offset: number,
        objectName: string
    ): vscode.CompletionItem[] {
        const visibleSymbols = this.cache.getVisibleSymbols(document, offset);
        const symbol = visibleSymbols.get(objectName);
        const items: vscode.CompletionItem[] = [];

        if (symbol && symbol.properties) {
            for (const [propName, propInfo] of symbol.properties) {
                const item = new vscode.CompletionItem(
                    propName,
                    propInfo.type.id === "function"
                        ? vscode.CompletionItemKind.Method
                        : vscode.CompletionItemKind.Property
                );
                item.detail = `${propInfo.type.id}`;
                item.documentation = new vscode.MarkdownString(
                    `Property **${propName}** of type \`${propInfo.type.id}\``
                );
                items.push(item);
            }
        }

        return items;
    }
}

// Hover provider with scope information and object properties
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

            // Add property information for objects
            if (symbol.properties && symbol.properties.size > 0) {
                markdown.appendMarkdown("\n\n**Properties:**\n");
                for (const [propName, propInfo] of symbol.properties) {
                    markdown.appendMarkdown(
                        `\n- \`${propName}\`: ${propInfo.type}`
                    );
                }
            }

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
    console.log(
        "Scope-aware hwscript IntelliSense extension with JSON parsing activated"
    );

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
