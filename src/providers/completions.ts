import * as vscode from "vscode";
import * as path from "path";
import { PREDEFINED_OBJECTS, PREDEFINED_VARIABLES } from "../predefined";
import { ProjectObjectCache } from "../project_object_cache";
import { make_type, PropertyInfo, ValueType, VariableInfo } from "../types";

interface ScopeInfo {
    prop: PropertyInfo;
    declarationLine: number;
    scopeStart: number;
    scopeEnd: number;
    scopeLevel: number;
    isVarDeclaration: boolean;
    isDuplicate?: boolean;
    duplicateLines?: number[];
}

interface BlockScope {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    level: number;
    type: "function" | "block" | "global";
}

const SORT_OBJECT = 100;
const SORT_FUNCTION = 101;
const SORT_VARIABLE = 102;
const SORT_CONST = 200;

function type_to_kind(
    vtype: ValueType,
    override_value?: vscode.CompletionItemKind
): vscode.CompletionItemKind {
    switch (vtype.id) {
        case "String":
        case "Number":
        case "Boolean":
        case "Any":
        case "Unknown":
            return override_value
                ? override_value
                : vscode.CompletionItemKind.Variable;

        case "Object":
            return vscode.CompletionItemKind.Module;
        case "Function":
            return vscode.CompletionItemKind.Function;
    }
}

export class HaiwellScriptCompletionProvider
    implements vscode.CompletionItemProvider
{
    private diagnosticCollection: vscode.DiagnosticCollection;
    private property_children?: PropertyInfo[];

    constructor() {
        this.diagnosticCollection =
            vscode.languages.createDiagnosticCollection("haiwellScript");
    }

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[] | vscode.CompletionList | undefined> {
        const linePrefix = document
            .lineAt(position)
            .text.substring(0, position.character);

        const dot = linePrefix.match(/((\w+)\.)+/);
        const haiwell = linePrefix.match(/^\$/);

        if (dot) {
            const objectName = dot[0].split(".").filter((s) => s !== "");
            const items = await this.getPropertyCompletions(
                objectName,
                document,
                position
            );
            return items.length > 0
                ? new vscode.CompletionList(items, false)
                : undefined;
        } else if (haiwell) {
            const items = await this.getHaiwellObjectCompletions();
            return items.length > 0
                ? new vscode.CompletionList(items, false)
                : undefined;
        }

        const items = await this.getObjectCompletions(document, position);

        // Update diagnostics for duplicate hoisted variables
        this.updateDiagnostics(document);

        return new vscode.CompletionList(items, false);
    }

    private async getObjectCompletions(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const completions: vscode.CompletionItem[] = [];
        const cache = ProjectObjectCache.getInstance();
        const projectObjects = await cache.getProjectObjects();
        let addedObjects = new Set<string>();

        // Collect local variables and functions with scope awareness
        try {
            const scopedSymbols = this.getScopedSymbols(document, position);

            for (const symbol of scopedSymbols) {
                if (addedObjects.has(symbol.prop.name)) {
                    continue;
                }

                const item = property_completion(symbol.prop);

                completions.push(item);
                addedObjects.add(symbol.prop.name);
            }
        } catch (err) {
            console.error(
                "Error while collecting local symbols for completions:",
                err
            );
        }

        // Predefined objects
        for (const objectName of Object.keys(PREDEFINED_OBJECTS)) {
            if (addedObjects.has(objectName)) {
                continue;
            }

            const properties = PREDEFINED_OBJECTS[objectName];
            const item = new vscode.CompletionItem(
                objectName,
                vscode.CompletionItemKind.Module
            );
            item.detail = `${objectName} (predefined)`;
            item.insertText = objectName;
            item.sortText = `${SORT_OBJECT}${objectName}`;
            item.commitCharacters = ["."];

            const propPreview = properties
                .slice(0, 5)
                .map((p) => `- ${p.name}`)
                .join("\n")
                .concat("\n- ...");

            item.documentation = new vscode.MarkdownString(
                `## ${objectName}\n` +
                    "---\n\n" +
                    "Properties:\n" +
                    `${propPreview}`
            );

            completions.push(item);
            addedObjects.add(objectName);
        }

        addedObjects = new Set([
            ...addedObjects,
            ...Object.keys(PREDEFINED_VARIABLES),
        ]);

        return completions;
    }

    private async getHaiwellObjectCompletions(): Promise<
        vscode.CompletionItem[]
    > {
        const completions: vscode.CompletionItem[] = [];
        const cache = ProjectObjectCache.getInstance();
        const definedObjects = cache.getUserVariables();
        const projectObjects = await cache.getProjectObjects();
        let addedObjects = new Set<string>();

        // Predefined Variables
        for (const [name, info] of Object.entries(PREDEFINED_VARIABLES)) {
            const varName = `\$${name.replace(/^_/, "")}`;

            if (addedObjects.has(varName)) {
                continue;
            }

            let doc;
            if (info.description) {
                doc =
                    `## ${varName} : \`${info.rawType}\`\n\n` +
                    `${info.description}\n\n`;
            } else {
                doc = `## ${varName} : \`${info.rawType}\`\n\n`;
            }

            const item = new vscode.CompletionItem(
                varName,
                vscode.CompletionItemKind.Constant
            );
            item.detail = `${varName} (system variable)`;
            item.insertText = varName;
            item.sortText = `${SORT_CONST}${varName}`;
            item.documentation = new vscode.MarkdownString(doc);

            completions.push(item);
        }

        // User defined objects
        for (const objectName of definedObjects) {
            if (addedObjects.has(objectName)) {
                continue;
            }

            const [group, variable] = objectName.split(".");

            const definition = cache.getUserVariableGroup(group);
            if (!definition) {
                continue;
            }

            const entry = !variable ? `\$${group}` : variable;
            const detail = !variable ? `${entry} (defined)` : group;
            const kind = !variable
                ? vscode.CompletionItemKind.Module
                : vscode.CompletionItemKind.Variable;
            const sort = !variable ? SORT_OBJECT : SORT_VARIABLE;

            const item = new vscode.CompletionItem(`\$${objectName}`, kind);
            item.insertText = `\$${objectName}`;
            item.detail = detail;
            item.sortText = `${sort}${objectName}`;
            item.commitCharacters = ["."];

            const propPreview = definition.properties
                .slice(0, 5)
                .map((p) => `- ${p.name}`)
                .join("\n")
                .concat("\n- ...");

            const f_path = path.basename(definition.sourceFile);
            item.documentation = new vscode.MarkdownString(
                `## \$${objectName}\n` +
                    "---\n\n" +
                    "**properties**:\n" +
                    `${propPreview}\n\n` +
                    `**location**:\`${f_path}\``
            );

            completions.push(item);
            addedObjects.add(objectName);
        }

        addedObjects = new Set([
            ...addedObjects,
            ...Object.keys(PREDEFINED_VARIABLES),
        ]);

        return completions;
    }

    /**
     * Parse the document and return symbols that are in scope at the given position.
     * Handles var (function-scoped), let/const (block-scoped), and function declarations.
     * Also detects duplicate declarations in the same scope.
     */
    private getScopedSymbols(
        document: vscode.TextDocument,
        position: vscode.Position
    ): ScopeInfo[] {
        const text = document.getText();
        const lines = text.split("\n");
        const currentLine = position.line;
        const currentChar = position.character;

        // Build all block scopes (for if, switch, while, for, functions, etc.)
        const scopes = this.buildBlockScopes(lines);

        // Find which scopes contain the current cursor position
        const containingScopes = scopes.filter((scope) =>
            this.isPositionInScope(currentLine, currentChar, scope, lines)
        );

        const allSymbols: ScopeInfo[] = [];
        const scopeDeclarations = new Map<string, Map<string, number[]>>(); // scope key -> name -> line numbers

        // Regex patterns for declarations
        const varRegex = /\b(var)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
        // const funcRegex = /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
        const funcRegex =
            /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)\s*{/;

        let cur_func = "";

        // Process each line looking for declarations
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];

            // Find variable declarations
            let match: RegExpExecArray | null;
            const tempVarRegex = new RegExp(varRegex.source, varRegex.flags);

            while ((match = tempVarRegex.exec(line)) !== null) {
                const keyword = match[1]; // var, let, or const
                const varName = match[2];
                const isVar = keyword === "var";

                // Find the scope where this variable is declared
                const declarationScopes = scopes.filter((scope) =>
                    this.isPositionInScope(lineNum, match!.index, scope, lines)
                );

                let effectiveScope: BlockScope;

                if (isVar) {
                    // var is function-scoped: hoist to nearest function or global
                    const varFunctionScope = declarationScopes
                        .filter((s) => s.type === "function")
                        .sort((a, b) => b.level - a.level)[0];
                    effectiveScope =
                        varFunctionScope ||
                        scopes.find((s) => s.type === "global")!;
                } else {
                    // let/const is block-scoped: use innermost containing scope
                    effectiveScope =
                        declarationScopes.sort(
                            (a, b) => b.level - a.level
                        )[0] || scopes.find((s) => s.type === "global")!;
                }

                // Track declarations per scope to detect duplicates
                const scopeKey = `${effectiveScope.startLine}-${effectiveScope.endLine}-${effectiveScope.level}`;
                if (!scopeDeclarations.has(scopeKey)) {
                    scopeDeclarations.set(scopeKey, new Map());
                }
                const scopeMap = scopeDeclarations.get(scopeKey)!;
                if (!scopeMap.has(varName)) {
                    scopeMap.set(varName, []);
                }
                scopeMap.get(varName)!.push(lineNum);

                // Check if this variable is accessible from current cursor position
                const isInScope = isVar
                    ? // var: available anywhere in its function scope
                      this.isPositionInScope(
                          currentLine,
                          currentChar,
                          effectiveScope,
                          lines
                      )
                    : // let/const: only after declaration line within block scope
                      (lineNum < currentLine ||
                          (lineNum === currentLine &&
                              match.index < currentChar)) &&
                      this.isPositionInScope(
                          currentLine,
                          currentChar,
                          effectiveScope,
                          lines
                      );

                const symbolInfo: ScopeInfo = {
                    prop: {
                        name: varName,
                        type: make_type.Any(),
                    },
                    declarationLine: lineNum,
                    scopeStart: effectiveScope.startLine,
                    scopeEnd: effectiveScope.endLine,
                    scopeLevel: effectiveScope.level,
                    isVarDeclaration: isVar,
                };

                if (isInScope) {
                    allSymbols.push(symbolInfo);
                }
            }

            // Find function declarations
            const tempFuncRegex = new RegExp(funcRegex.source, funcRegex.flags);

            match = tempFuncRegex.exec(cur_func);
            if (match === null) {
                cur_func += line;
                continue;
            }

            const funcName = match[1];
            const params = match[2]
                ? match[2].replace(/\s/g, "").split(",")
                : [];

            // Find the scope where this function is declared
            const declarationScopes = scopes.filter((scope) =>
                this.isPositionInScope(lineNum, match!.index, scope, lines)
            );

            // Functions are hoisted within their containing scope
            const effectiveScope =
                declarationScopes.sort((a, b) => b.level - a.level)[0] ||
                scopes.find((s) => s.type === "global")!;

            // Track function declarations per scope to detect duplicates
            const scopeKey = `${effectiveScope.startLine}-${effectiveScope.endLine}-${effectiveScope.level}`;
            if (!scopeDeclarations.has(scopeKey)) {
                scopeDeclarations.set(scopeKey, new Map());
            }
            const scopeMap = scopeDeclarations.get(scopeKey)!;
            if (!scopeMap.has(funcName)) {
                scopeMap.set(funcName, []);
            }
            scopeMap.get(funcName)!.push(lineNum);

            // Function declarations are available anywhere in their scope (hoisted)
            const isInScope = this.isPositionInScope(
                currentLine,
                currentChar,
                effectiveScope,
                lines
            );

            const symbolInfo: ScopeInfo = {
                prop: {
                    name: funcName,
                    type: make_type.Function(params),
                },
                declarationLine: lineNum,
                scopeStart: effectiveScope.startLine,
                scopeEnd: effectiveScope.endLine,
                scopeLevel: effectiveScope.level,
                isVarDeclaration: false,
            };

            allSymbols.push(symbolInfo);

            cur_func = "";
        }

        // Mark duplicates
        for (const [scopeKey, nameMap] of scopeDeclarations.entries()) {
            for (const [name, lines] of nameMap.entries()) {
                if (lines.length > 1) {
                    // This name has multiple declarations in the same scope
                    for (const symbol of allSymbols) {
                        if (
                            symbol.prop.name === name &&
                            lines.includes(symbol.declarationLine)
                        ) {
                            symbol.isDuplicate = true;
                            symbol.duplicateLines = lines;
                        }
                    }
                }
            }
        }

        // Remove duplicate entries (keep first occurrence for each name)
        const seenNames = new Set<string>();
        const uniqueSymbols: ScopeInfo[] = [];

        for (const symbol of allSymbols) {
            if (!seenNames.has(symbol.prop.name)) {
                uniqueSymbols.push(symbol);
                seenNames.add(symbol.prop.name);
            }
        }

        return uniqueSymbols;
    }

    /**
     * Build a map of all block scopes in the document.
     * Handles functions, if, switch, while, for, and other block statements.
     */
    private buildBlockScopes(lines: string[]): BlockScope[] {
        const scopes: BlockScope[] = [];
        const stack: {
            line: number;
            col: number;
            level: number;
            type: "function" | "block";
        }[] = [];
        let level = 0;

        // Add global scope
        scopes.push({
            startLine: 0,
            endLine: lines.length - 1,
            startCol: 0,
            endCol: 0,
            level: 0,
            type: "global",
        });

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];

            for (let col = 0; col < line.length; col++) {
                const char = line[col];

                if (char === "{") {
                    // Determine if this is a function scope or block scope
                    let isFunctionScope = false;
                    let searchText = "";

                    // Get text from start of line up to this brace
                    searchText = line.substring(0, col);

                    // Also check previous lines (up to 3 lines back for multi-line function declarations)
                    for (let i = 1; i <= 3 && lineNum - i >= 0; i++) {
                        searchText = lines[lineNum - i] + " " + searchText;
                    }

                    // Check for function keyword
                    if (
                        /\bfunction\s+[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)\s*$/.test(
                            searchText.trim()
                        ) ||
                        /\bfunction\s*\([^)]*\)\s*$/.test(searchText.trim())
                    ) {
                        isFunctionScope = true;
                    }

                    level++;
                    stack.push({
                        line: lineNum,
                        col: col,
                        level: level,
                        type: isFunctionScope ? "function" : "block",
                    });
                } else if (char === "}") {
                    const opening = stack.pop();
                    if (opening) {
                        scopes.push({
                            startLine: opening.line,
                            endLine: lineNum,
                            startCol: opening.col,
                            endCol: col,
                            level: opening.level,
                            type: opening.type,
                        });
                    }
                    level = Math.max(0, level - 1);
                }
            }
        }

        return scopes;
    }

    /**
     * Check if a position is within a scope.
     */
    private isPositionInScope(
        line: number,
        char: number,
        scope: BlockScope,
        lines: string[]
    ): boolean {
        // Position must be after the opening brace
        if (line < scope.startLine) {
            return false;
        }
        if (line === scope.startLine && char <= scope.startCol) {
            return false;
        }

        // Position must be before or at the closing brace
        if (line > scope.endLine) {
            return false;
        }
        if (line === scope.endLine && char > scope.endCol) {
            return false;
        }

        return true;
    }

    /**
     * Check if a symbol is accessible at the given position based on scoping rules
     */
    private isSymbolInScopeAtPosition(
        symbol: ScopeInfo,
        position: vscode.Position
    ): boolean {
        const currentLine = position.line;
        const currentChar = position.character;

        // Check if cursor is within the symbol's scope boundaries
        if (currentLine < symbol.scopeStart || currentLine > symbol.scopeEnd) {
            return false;
        }

        // For var and function declarations (hoisted), available anywhere in scope
        if (
            symbol.isVarDeclaration ||
            type_to_kind(symbol.prop.type) ===
                vscode.CompletionItemKind.Function
        ) {
            return true;
        }

        // For let/const, must be declared before cursor position
        if (currentLine > symbol.declarationLine) {
            return true;
        }

        if (currentLine === symbol.declarationLine) {
            // On the same line, cursor must be after the declaration
            return false; // Conservative: don't show on same line as declaration
        }

        return false;
    }

    /**
     * Update diagnostics to show errors for duplicate hoisted declarations
     */
    private updateDiagnostics(document: vscode.TextDocument): void {
        const text = document.getText();
        const lines = text.split("\n");
        const scopes = this.buildBlockScopes(lines);

        const diagnostics: vscode.Diagnostic[] = [];
        const scopeDeclarations = new Map<
            string,
            Map<string, Array<{ line: number; col: number; keyword: string }>>
        >();

        const varRegex = /\b(var)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
        const funcRegex = /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;

        // Collect all declarations
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];

            // Process variable declarations
            let match: RegExpExecArray | null;
            const tempVarRegex = new RegExp(varRegex.source, varRegex.flags);

            while ((match = tempVarRegex.exec(line)) !== null) {
                const keyword = match[1];
                const varName = match[2];
                const isVar = keyword === "var";

                const declarationScopes = scopes.filter((scope) =>
                    this.isPositionInScope(lineNum, match!.index, scope, lines)
                );

                let effectiveScope: BlockScope;

                if (isVar) {
                    const varFunctionScope = declarationScopes
                        .filter((s) => s.type === "function")
                        .sort((a, b) => b.level - a.level)[0];
                    effectiveScope =
                        varFunctionScope ||
                        scopes.find((s) => s.type === "global")!;
                } else {
                    effectiveScope =
                        declarationScopes.sort(
                            (a, b) => b.level - a.level
                        )[0] || scopes.find((s) => s.type === "global")!;
                }

                const scopeKey = `${effectiveScope.startLine}-${effectiveScope.endLine}-${effectiveScope.level}`;
                if (!scopeDeclarations.has(scopeKey)) {
                    scopeDeclarations.set(scopeKey, new Map());
                }
                const scopeMap = scopeDeclarations.get(scopeKey)!;
                if (!scopeMap.has(varName)) {
                    scopeMap.set(varName, []);
                }
                scopeMap
                    .get(varName)!
                    .push({ line: lineNum, col: match.index, keyword });
            }

            // Process function declarations
            const tempFuncRegex = new RegExp(funcRegex.source, funcRegex.flags);

            while ((match = tempFuncRegex.exec(line)) !== null) {
                const funcName = match[1];

                const declarationScopes = scopes.filter((scope) =>
                    this.isPositionInScope(lineNum, match!.index, scope, lines)
                );

                const effectiveScope =
                    declarationScopes.sort((a, b) => b.level - a.level)[0] ||
                    scopes.find((s) => s.type === "global")!;

                const scopeKey = `${effectiveScope.startLine}-${effectiveScope.endLine}-${effectiveScope.level}`;
                if (!scopeDeclarations.has(scopeKey)) {
                    scopeDeclarations.set(scopeKey, new Map());
                }
                const scopeMap = scopeDeclarations.get(scopeKey)!;
                if (!scopeMap.has(funcName)) {
                    scopeMap.set(funcName, []);
                }
                scopeMap.get(funcName)!.push({
                    line: lineNum,
                    col: match.index,
                    keyword: "function",
                });
            }
        }

        // Create diagnostics for duplicates
        for (const [scopeKey, nameMap] of scopeDeclarations.entries()) {
            for (const [name, declarations] of nameMap.entries()) {
                if (declarations.length > 1) {
                    const firstDecl = declarations[0];
                    const isVar = firstDecl.keyword === "var";
                    const isFunction = firstDecl.keyword === "function";

                    // Show error on all duplicate declarations except the first
                    for (let i = 1; i < declarations.length; i++) {
                        const decl = declarations[i];
                        const line = lines[decl.line];
                        const startPos = new vscode.Position(
                            decl.line,
                            decl.col
                        );
                        const endPos = new vscode.Position(
                            decl.line,
                            decl.col + decl.keyword.length + 1 + name.length
                        );

                        let message: string;
                        if (isFunction) {
                            message = `Duplicate function declaration '${name}'. This will override the previous declaration at line ${
                                firstDecl.line + 1
                            }.`;
                        } else if (isVar) {
                            message = `Duplicate 'var' declaration '${name}'. Due to hoisting, this refers to the same variable declared at line ${
                                firstDecl.line + 1
                            }.`;
                        } else {
                            message = `Duplicate '${decl.keyword}' declaration '${name}' in the same block scope.`;
                        }

                        const diagnostic = new vscode.Diagnostic(
                            new vscode.Range(startPos, endPos),
                            message,
                            vscode.DiagnosticSeverity.Warning
                        );
                        diagnostic.code = "duplicate-declaration";
                        diagnostic.source = "HaiwellScript";

                        diagnostics.push(diagnostic);
                    }
                }
            }
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private async getPropertyCompletions(
        obj: string[],
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const getInitialProperties = (
            objName: string,
            document: any,
            position: any
        ): PropertyInfo[] => {
            const localProps = this.getLocalObjectProperties(
                objName,
                document,
                position
            );

            if (localProps.length > 0) {
                return localProps;
            }

            const cache = ProjectObjectCache.getInstance();
            return cache.getObjectProperties(objName);
        };

        const get_props = (obj_names: string[]): PropertyInfo[] => {
            if (obj_names.length === 0) {
                return [];
            }

            const [firstObjName, ...restNames] = obj_names;
            const initialProps = getInitialProperties(
                firstObjName,
                document,
                position
            );

            return (
                restNames.reduce<PropertyInfo[] | undefined>(
                    (children, name) => {
                        if (!children) {
                            return undefined;
                        }

                        const property = children.find((p) => p.name === name);

                        return property?.type.id === "Object"
                            ? property.type.child
                            : undefined;
                    },
                    initialProps
                ) ?? []
            );
        };

        // Prefer local properties if available, otherwise fall back to cached/project definitions
        const properties = get_props(obj);

        if (properties.length === 0) {
            return [];
        }

        return properties.map((prop) => {
            const item = property_completion(prop);
            const md = new vscode.MarkdownString();

            if (prop.rawType === undefined) {
                md.appendMarkdown(`## ${prop.name} : \`ANY\`\n\n`);
            } else {
                md.appendMarkdown(`## ${prop.name} : \`${prop.rawType}\`\n\n`);
            }

            if (prop.description) {
                md.appendMarkdown(`${prop.description}\n`);
            }

            if (
                prop.type.id === "String" &&
                prop.type.value_len !== undefined
            ) {
                md.appendMarkdown("---\n");
                md.appendMarkdown(`**length**: ${prop.type.value_len}`);
            }

            item.documentation = md;
            return item;
        });
    }

    private getLocalObjectProperties(
        objectName: string,
        document: vscode.TextDocument,
        position: vscode.Position
    ): PropertyInfo[] {
        const props = new Set<string>();

        try {
            const text = document.getText();
            const currentOffset = document.offsetAt(position);

            // Match var/let/const <n> = { ... }
            const varRegex = new RegExp(
                "\\b(?:var)\\s+" + objectName + "\\s*=\\s*\\{([\\s\\S]*?)\\}",
                "g"
            );

            // Match <n> = { ... } (assignment)
            const assignRegex = new RegExp(
                "\\b" + objectName + "\\s*=\\s*\\{([\\s\\S]*?)\\}",
                "g"
            );

            let match: RegExpExecArray | null;

            const extractProps = (body: string, matchOffset: number) => {
                // Only extract if the match is before or at the current cursor position
                if (matchOffset <= currentOffset) {
                    const keyRegex =
                        /(?:['"])?([A-Za-z_][A-Za-z0-9_]*)(?:['"])?\s*:/g;
                    let m: RegExpExecArray | null;
                    while ((m = keyRegex.exec(body)) !== null) {
                        props.add(m[1]);
                    }
                }
            };

            while ((match = varRegex.exec(text)) !== null) {
                extractProps(match[1], match.index);
            }

            // Only attempt assignRegex if we didn't find via var/let/const
            if (props.size === 0) {
                while ((match = assignRegex.exec(text)) !== null) {
                    extractProps(match[1], match.index);
                }
            }
        } catch (err) {
            console.error("Error extracting local object properties:", err);
        }

        return Array.from(props).map((name) => ({
            name,
            type: make_type.Any(),
        }));
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.diagnosticCollection.dispose();
    }
}

function property_completion(prop: PropertyInfo): vscode.CompletionItem {
    let commit_chars;
    let insert_text;
    let kind;
    let sort;

    switch (prop.type.id) {
        case "Object":
            kind = vscode.CompletionItemKind.Module;
            sort = SORT_OBJECT;
            commit_chars = ["."];

            break;

        case "Function":
            kind = vscode.CompletionItemKind.Function;
            sort = SORT_FUNCTION;

            if (
                prop.type.params === undefined ||
                prop.type.params.length <= 0
            ) {
                insert_text = `${prop.name}()`;
            } else {
                const param_str = prop.type.params
                    .map((param, id) => {
                        return `\$\{${id + 1}:${param.name}\}`;
                    })
                    .join(", ");

                insert_text = new vscode.SnippetString(
                    `${prop.name}(${param_str})`
                );
            }
            break;

        default:
            kind = vscode.CompletionItemKind.Variable;
            insert_text = prop.name;
            sort = SORT_VARIABLE;
            break;
    }

    const item = new vscode.CompletionItem(prop.name, kind);
    item.detail = `${prop.name}: ${prop.type.id}`;
    item.commitCharacters = commit_chars;
    item.insertText = insert_text;
    item.sortText = `${sort}${prop.name}`;

    return item;
}
