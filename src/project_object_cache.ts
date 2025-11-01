import * as vscode from "vscode";
import * as path from "path";
import { make_type, PropertyInfo, VariableInfo } from "./types";
import { BUILTIN_OBJ, BUILTIN_VAR } from "./predefined";

export interface ObjectUsage {
    files: Set<string>;
    properties: Set<string>;
}

export interface VariableGroup {
    name: string;
    properties: PropertyInfo[];
    sourceFile: string;
}

export interface GlobalSymbol {
    name: string;
    kind: "function" | "variable" | "class" | "other";
    sourceFile: string;
}

export class ProjectObjectCache {
    private static instance: ProjectObjectCache;
    private objectUsageMap: Map<string, ObjectUsage> = new Map();
    private variable_group: Map<string, VariableGroup> = new Map();
    private globalSymbols: Map<string, GlobalSymbol> = new Map();
    private builtin_obj_extensions: Map<string, VariableInfo> = new Map();
    private isIndexing: boolean = false;
    private lastIndexTime: number = 0;
    private readonly INDEX_INTERVAL = 2000;

    static getInstance(): ProjectObjectCache {
        if (!ProjectObjectCache.instance) {
            ProjectObjectCache.instance = new ProjectObjectCache();
        }
        return ProjectObjectCache.instance;
    }

    async initialize(): Promise<void> {
        await this.loadVariableDefinitions();
        // await this.loadLibDefinitions();
        await this.indexProject();
    }

    async loadVariableDefinitions(): Promise<void> {
        this.variable_group.clear();

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            console.log("No workspace folders found");
            return;
        }

        console.log(
            `Searching for variable CSV files in ${workspaceFolders.length} workspace folder(s)`
        );

        for (const folder of workspaceFolders) {
            const variableDirPath = path.join(folder.uri.fsPath, "variable");
            console.log(`Looking for CSV files in: ${variableDirPath}`);

            try {
                const csvFiles = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(folder, "variable/*.csv"),
                    null,
                    100
                );

                console.log(`Found ${csvFiles.length} CSV files`);

                for (const csvFile of csvFiles) {
                    console.log(`Parsing: ${csvFile.fsPath}`);
                    await this.parseVariableCSV(csvFile);
                }
            } catch (error) {
                console.error("Error loading variable definitions:", error);
            }
        }

        console.log(
            `Loaded ${this.variable_group.size} variable definitions from CSV files`
        );
        if (this.variable_group.size > 0) {
            console.log(
                "Defined objects:",
                Array.from(this.variable_group.keys())
            );
        }
    }

    // async loadLibDefinitions(): Promise<void> {
    //     this.globalSymbols.clear();

    //     const workspaceFolders = vscode.workspace.workspaceFolders;
    //     if (!workspaceFolders) {
    //         return;
    //     }

    //     for (const folder of workspaceFolders) {
    //         try {
    //             const libFiles = await vscode.workspace.findFiles(
    //                 new vscode.RelativePattern(folder, "lib/**/*.{ts,js,csv}"),
    //                 null,
    //                 1000
    //             );

    //             for (const f of libFiles) {
    //                 if (f.fsPath.endsWith(".csv")) {
    //                     // CSV files in lib may define variable objects similar to variable/*.csv
    //                     await this.parseVariableCSV(f);
    //                 } else {
    //                     await this.parseLibScriptFile(f);
    //                 }
    //             }
    //         } catch (err) {
    //             console.error("Error loading lib definitions:", err);
    //         }
    //     }

    //     console.log(
    //         `Loaded ${this.globalSymbols.size} global symbols from lib`
    //     );
    // }

    // async parseLibScriptFile(fileUri: vscode.Uri): Promise<void> {
    //     try {
    //         const document = await vscode.workspace.openTextDocument(fileUri);
    //         const text = document.getText();

    //         // // Match ES module named exports: export const/name/function/class X
    //         const exportDecl =
    //             /export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    //         let m: RegExpExecArray | null;
    //         while ((m = exportDecl.exec(text)) !== null) {
    //             const name = m[1];
    //             const kind = /function/.test(m[0])
    //                 ? "function"
    //                 : /class/.test(m[0])
    //                 ? "class"
    //                 : "variable";
    //             this.globalSymbols.set(name, {
    //                 name,
    //                 kind: kind as GlobalSymbol["kind"],
    //                 sourceFile: fileUri.fsPath,
    //             });
    //         }

    //         // export { a, b as c }
    //         const exportList = /export\s*\{([\s\S]*?)\}/g;
    //         while ((m = exportList.exec(text)) !== null) {
    //             const body = m[1];
    //             const parts = body.split(",").map((p) => p.trim());
    //             for (const p of parts) {
    //                 const name = p.includes(" as ")
    //                     ? p.split(" as ")[1].trim()
    //                     : p.split(" as ")[0].trim();
    //                 if (name) {
    //                     this.globalSymbols.set(name, {
    //                         name,
    //                         kind: "other",
    //                         sourceFile: fileUri.fsPath,
    //                     });
    //                 }
    //             }
    //         }

    //         // export default function fname() { } or export default class Name {}
    //         const exportDefault =
    //             /export\s+default\s+(?:function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    //         while ((m = exportDefault.exec(text)) !== null) {
    //             const name = m[1];
    //             if (name) {
    //                 this.globalSymbols.set(name, {
    //                     name,
    //                     kind: /class/.test(m[0]) ? "class" : "function",
    //                     sourceFile: fileUri.fsPath,
    //                 });
    //             }
    //         }

    //         // CommonJS exports: module.exports.foo = or exports.foo =
    //         const cjs =
    //             /(?:module\.exports|exports)\.([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g;
    //         while ((m = cjs.exec(text)) !== null) {
    //             const name = m[1];
    //             this.globalSymbols.set(name, {
    //                 name,
    //                 kind: "variable",
    //                 sourceFile: fileUri.fsPath,
    //             });
    //         }
    //     } catch (err) {
    //         console.error(`Error parsing lib script ${fileUri.fsPath}:`, err);
    //     }
    // }

    getGlobalSymbols(): GlobalSymbol[] {
        return Array.from(this.globalSymbols.values());
    }

    getGlobalSymbol(name: string): GlobalSymbol | undefined {
        return this.globalSymbols.get(name);
    }

    async parseVariableCSV(fileUri: vscode.Uri): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(fileUri);
            const content = document.getText();

            // Robust CSV parsing: supports quoted fields, commas inside quotes,
            // and records that span multiple lines when a quoted field contains newlines.
            const rows: { fields: string[]; line: number }[] = [];

            const rawLines = content.split(/\r?\n/);
            let idx = 0;
            while (idx < rawLines.length) {
                let lineText = rawLines[idx];
                let recordStartLine = idx + 1; // 1-based

                // If quotes are unbalanced on this line, keep appending following lines
                const countQuotes = (s: string) => (s.match(/"/g) || []).length;
                while (
                    countQuotes(lineText) % 2 !== 0 &&
                    idx + 1 < rawLines.length
                ) {
                    idx++;
                    lineText += "\n" + rawLines[idx];
                }

                // Parse fields for this (possibly multi-line) record
                const fields: string[] = [];
                let field = "";
                let inQuotes = false;
                for (let i = 0; i < lineText.length; i++) {
                    const ch = lineText[i];
                    if (inQuotes) {
                        if (ch === '"') {
                            // double quote escape
                            if (
                                i + 1 < lineText.length &&
                                lineText[i + 1] === '"'
                            ) {
                                field += '"';
                                i++; // skip escaped quote
                            } else {
                                inQuotes = false;
                            }
                        } else {
                            field += ch;
                        }
                    } else {
                        if (ch === '"') {
                            inQuotes = true;
                        } else if (ch === ",") {
                            fields.push(field.trim());
                            field = "";
                        } else {
                            field += ch;
                        }
                    }
                }
                fields.push(field.trim());

                rows.push({ fields, line: recordStartLine });
                idx++;
            }

            if (rows.length < 2) {
                return; // no data rows
            }

            const header = rows[0].fields.map((h) =>
                h
                    .replace(/^['\"]|['\"]$/g, "")
                    .toLowerCase()
                    .trim()
            );

            const findHeaderIndex = (aliases: string[]): number => {
                for (let i = 0; i < header.length; i++) {
                    const h = header[i];
                    for (const a of aliases) {
                        if (h === a || h.includes(a)) {
                            return i;
                        }
                    }
                }
                return -1;
            };

            const nameIdx = findHeaderIndex(["variable name"]);
            const typeIdx = findHeaderIndex(["data type"]);
            const descIdx = findHeaderIndex(["variable description"]);
            const stringLenIdx = findHeaderIndex(["string length"]);

            const fileName = path.basename(fileUri.fsPath, ".csv");
            const objectName = fileName;

            const properties: PropertyInfo[] = [];
            for (let r = 1; r < rows.length; r++) {
                const row = rows[r];

                let a = Number.isNaN(row.fields[0]);
                if (row.fields[0] === "") {
                    continue;
                }

                const cols = row.fields.map((c) =>
                    c.replace(/^['\"]|['\"]$/g, "").trim()
                );
                const name = cols[nameIdx >= 0 ? nameIdx : 0] || "";
                let rawType = (
                    typeIdx >= 0 ? cols[typeIdx] : cols[1] || ""
                ).toString();
                rawType = rawType.trim();

                // map common vendor types to normalized types
                const t = rawType.toLowerCase();
                let mappedType = make_type.Any();
                if (
                    t.includes("char") ||
                    t.includes("string") ||
                    t.includes("varchar") ||
                    t.includes("text")
                ) {
                    let stringLength: number | undefined;
                    if (stringLenIdx >= 0) {
                        const sl = parseInt(cols[stringLenIdx] || "", 10);
                        if (!isNaN(sl)) {
                            stringLength = sl;
                        }
                    }
                    mappedType = make_type.String(stringLength);
                } else if (
                    t.includes("int") ||
                    t.includes("float") ||
                    t.includes("double") ||
                    t.includes("number") ||
                    t.includes("uint") ||
                    t.includes("short") ||
                    t.includes("long")
                ) {
                    mappedType = make_type.Number();
                } else if (t.includes("bool")) {
                    mappedType = make_type.Boolean();
                } else if (t.length === 0) {
                    mappedType = make_type.Any();
                } else {
                    mappedType = make_type.Unknown(t); // unknown type, keep raw
                }

                const description =
                    descIdx >= 0 ? cols[descIdx] || undefined : undefined;

                if (name) {
                    const prop: PropertyInfo = {
                        name,
                        type: mappedType,
                        sourceLine: row.line,
                        rawType: rawType,
                    };

                    if (description) {
                        prop.description = description;
                    }

                    properties.push(prop);
                }
            }

            if (properties.length > 0) {
                this.variable_group.set(objectName, {
                    name: objectName,
                    properties,
                    sourceFile: fileUri.fsPath,
                });
            }
        } catch (error) {
            console.error(`Error parsing CSV file ${fileUri.fsPath}:`, error);
        }
    }

    getUserVariables(): string[] {
        const variables = Array.from(this.variable_group.entries()).flatMap(
            ([k, v]) => {
                return v.properties.map((prop) => k + "." + prop.name);
            }
        );

        return [...Array.from(this.variable_group.keys()), ...variables];
    }

    getUserVariableGroup(objectName: string): VariableGroup | undefined {
        return this.variable_group.get(objectName);
    }

    isObjectDefined(objectName: string): boolean {
        return (
            this.variable_group.has(objectName) ||
            BUILTIN_OBJ.hasOwnProperty(objectName) ||
            BUILTIN_VAR.hasOwnProperty(objectName)
        );
    }

    getObjectProperties(objectName: string): PropertyInfo[] {
        const definition = this.variable_group.get(objectName);
        if (definition) {
            return definition.properties;
        }

        const predefined = Object.entries(BUILTIN_OBJ[objectName]).map(
            ([k, v]): PropertyInfo => {
                return {
                    name: k,
                    type: v.type,
                    description: v.description,
                    rawType: v.rawType,
                    sourceLine: v.sourceLine,
                };
            }
        );

        if (predefined) {
            return predefined;
        }

        // const usage = this.objectUsageMap.get(objectName);
        // if (usage && usage.properties.size > 0) {
        //     return Array.from(usage.properties).map((name) => ({
        //         name,
        //         type: make_type.Any(),
        //     }));
        // }

        return [];
    }

    // async getProjectObjects(): Promise<Map<string, ObjectUsage>> {
    //     const now = Date.now();
    //     if (
    //         now - this.lastIndexTime > this.INDEX_INTERVAL &&
    //         !this.isIndexing
    //     ) {
    //         await this.indexProject();
    //     }
    //     return this.objectUsageMap;
    // }

    async indexProject(): Promise<void> {
        if (this.isIndexing) {
            return;
        }

        this.isIndexing = true;
        this.objectUsageMap.clear();

        try {
            const files = await vscode.workspace.findFiles(
                "**/*.{hws,hwscript}",
                "**/node_modules/**",
                1000
            );

            for (const fileUri of files) {
                try {
                    const document = await vscode.workspace.openTextDocument(
                        fileUri
                    );
                    this.indexDocument(document);
                } catch (error) {
                    console.error(`Error indexing ${fileUri.fsPath}:`, error);
                }
            }

            this.lastIndexTime = Date.now();
        } finally {
            this.isIndexing = false;
        }
    }

    indexDocument(document: vscode.TextDocument): void {
        const dollarObjectPattern =
            /\$([A-Za-z_][A-Za-z0-9_]*)(?:\.([A-Za-z_][A-Za-z0-9_]*))?/g;
        const fileUri = document.uri.toString();

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;
            let match: RegExpExecArray | null;

            while ((match = dollarObjectPattern.exec(line)) !== null) {
                const objectName = match[1];
                const propertyName = match[2];

                if (!this.objectUsageMap.has(objectName)) {
                    this.objectUsageMap.set(objectName, {
                        files: new Set(),
                        properties: new Set(),
                    });
                }

                const usage = this.objectUsageMap.get(objectName)!;
                usage.files.add(fileUri);

                if (propertyName) {
                    usage.properties.add(propertyName);
                }
            }
        }
    }

    updateDocument(document: vscode.TextDocument): void {
        const fileUri = document.uri.toString();
        for (const [objectName, usage] of this.objectUsageMap.entries()) {
            usage.files.delete(fileUri);
            if (usage.files.size === 0) {
                this.objectUsageMap.delete(objectName);
            }
        }
        this.indexDocument(document);
    }

    clear(): void {
        this.objectUsageMap.clear();
        this.variable_group.clear();
        this.globalSymbols.clear();
        this.lastIndexTime = 0;
    }
}
