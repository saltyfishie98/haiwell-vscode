import * as vscode from "vscode";
import * as path from "path";

interface ObjectPropertyMap {
  [key: string]: PropertyInfo[];
}

interface PropertyInfo {
  name: string;
  type: string;
}

interface ObjectUsage {
  files: Set<string>;
  properties: Set<string>;
}

interface VariableDefinition {
  objectName: string;
  properties: PropertyInfo[];
  sourceFile: string;
}

const PREDEFINED_OBJECT_PROPERTY_MAP: ObjectPropertyMap = {
  Window: [
    { name: "width", type: "number" },
    { name: "height", type: "number" },
    { name: "title", type: "string" },
    { name: "close", type: "function" },
    { name: "open", type: "function" },
    { name: "location", type: "string" },
    { name: "focus", type: "function" },
    { name: "blur", type: "function" },
  ],
  Console: [
    { name: "log", type: "function" },
    { name: "error", type: "function" },
    { name: "warn", type: "function" },
    { name: "info", type: "function" },
  ],
  Math: [
    { name: "random", type: "function" },
    { name: "floor", type: "function" },
    { name: "ceil", type: "function" },
    { name: "PI", type: "number" },
    { name: "E", type: "number" },
  ],
};

// Global cache for project objects and their properties
class ProjectObjectCache {
  private static instance: ProjectObjectCache;
  private objectUsageMap: Map<string, ObjectUsage> = new Map();
  private variableDefinitions: Map<string, VariableDefinition> = new Map();
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
    await this.indexProject();
  }

  async loadVariableDefinitions(): Promise<void> {
    this.variableDefinitions.clear();

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
      `Loaded ${this.variableDefinitions.size} variable definitions from CSV files`
    );
    if (this.variableDefinitions.size > 0) {
      console.log(
        "Defined objects:",
        Array.from(this.variableDefinitions.keys())
      );
    }
  }

  async parseVariableCSV(fileUri: vscode.Uri): Promise<void> {
    try {
      const document = await vscode.workspace.openTextDocument(fileUri);
      const content = document.getText();
      const lines = content.split(/\r?\n/).filter((line) => line.trim());

      if (lines.length < 2) {
        return;
      }

      const fileName = path.basename(fileUri.fsPath, ".csv");
      const objectName = fileName;

      const properties: PropertyInfo[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          continue;
        }

        const parts = line
          .split(",")
          .map((p) => p.trim().replace(/^["']|["']$/g, ""));

        if (parts.length >= 2) {
          const name = parts[0];
          const type = parts[1];

          if (name && type) {
            properties.push({ name, type });
          }
        }
      }

      if (properties.length > 0) {
        this.variableDefinitions.set(objectName, {
          objectName,
          properties,
          sourceFile: fileUri.fsPath,
        });
      }
    } catch (error) {
      console.error(`Error parsing CSV file ${fileUri.fsPath}:`, error);
    }
  }

  getDefinedObjects(): string[] {
    return Array.from(this.variableDefinitions.keys());
  }

  getObjectDefinition(objectName: string): VariableDefinition | undefined {
    return this.variableDefinitions.get(objectName);
  }

  isObjectDefined(objectName: string): boolean {
    return (
      this.variableDefinitions.has(objectName) ||
      PREDEFINED_OBJECT_PROPERTY_MAP.hasOwnProperty(objectName)
    );
  }

  getObjectProperties(objectName: string): PropertyInfo[] {
    const definition = this.variableDefinitions.get(objectName);
    if (definition) {
      return definition.properties;
    }

    const predefined = PREDEFINED_OBJECT_PROPERTY_MAP[objectName];
    if (predefined) {
      return predefined;
    }

    const usage = this.objectUsageMap.get(objectName);
    if (usage && usage.properties.size > 0) {
      return Array.from(usage.properties).map((name) => ({
        name,
        type: "any",
      }));
    }

    return [];
  }

  async getProjectObjects(): Promise<Map<string, ObjectUsage>> {
    const now = Date.now();
    if (now - this.lastIndexTime > this.INDEX_INTERVAL && !this.isIndexing) {
      await this.indexProject();
    }
    return this.objectUsageMap;
  }

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
          const document = await vscode.workspace.openTextDocument(fileUri);
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
    this.variableDefinitions.clear();
    this.lastIndexTime = 0;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("Haiwell Script extension is now active");

  const cache = ProjectObjectCache.getInstance();
  cache.initialize();

  const variableWatcher =
    vscode.workspace.createFileSystemWatcher("**/variable/*.csv");
  variableWatcher.onDidChange(() => cache.loadVariableDefinitions());
  variableWatcher.onDidCreate(() => cache.loadVariableDefinitions());
  variableWatcher.onDidDelete(() => cache.loadVariableDefinitions());

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
    docChangeListener,
    docSaveListener,
    diagnosticCollection,
    reindexCommand
  );
}

class HaiwellScriptCompletionProvider implements vscode.CompletionItemProvider {
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
      const items = await this.getPropertyCompletions(objectName, document);
      return items.length > 0
        ? new vscode.CompletionList(items, false)
        : undefined;
    }

    if (linePrefix.endsWith("$")) {
      const items = await this.getUserVariable(document);
      return new vscode.CompletionList(items, false);
    }

    const items = await this.getObjectCompletions(document);
    return new vscode.CompletionList(items, false);
  }

  private async getUserVariable(
    document: vscode.TextDocument
  ): Promise<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];
    const cache = ProjectObjectCache.getInstance();
    const definedObjects = cache.getDefinedObjects();
    const projectObjects = await cache.getProjectObjects();
    const addedObjects = new Set<string>();

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

  private async getObjectCompletions(
    document: vscode.TextDocument
  ): Promise<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];
    const addedObjects = new Set<string>();

    // Collect local variables and functions declared in the current document
    // and add them as high-priority completions (local context)
    try {
      const text = document.getText();
      const localVarRegex = /\b(?:var|let|const)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
      const localFuncRegex = /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;

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
      item.sortText = `2${objectName}`;

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
      item.documentation = new vscode.MarkdownString(
        `Property **${prop.name}** of type \`${prop.type}\``
      );
      return item;
    });
  }

  /**
   * Extract properties from a local object literal defined in the current document.
   * Supports patterns like:
   *   var foo = { a: 1, b: 2 };
   *   let foo = {
   *     a: 1,
   *     'b': 2
   *   };
   */
  private getLocalObjectProperties(
    objectName: string,
    document: vscode.TextDocument
  ): PropertyInfo[] {
    const props = new Set<string>();

    try {
      const text = document.getText();

      // Match var/let/const <name> = { ... }
      const varRegex = new RegExp(
        "\\b(?:var|let|const)\\s+" + objectName + "\\s*=\\s*\\{([\\s\\S]*?)\\}",
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
        const keyRegex = /(?:['"])?([A-Za-z_][A-Za-z0-9_]*)(?:['"])?\s*:/g;
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

class HaiwellScriptHoverProvider implements vscode.HoverProvider {
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | undefined> {
    const range = document.getWordRangeAtPosition(position, /\$\w+(\.\w+)?/);
    if (!range) {
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
      markdown.appendCodeblock(`$${objectName}.${propertyName}`, "hwscript");
      const properties = cache.getObjectProperties(objectName);
      const prop = properties.find((p) => p.name === propertyName);
      if (prop) {
        markdown.appendMarkdown(`\n\nType: \`${prop.type}\``);
      }
    } else {
      markdown.appendCodeblock(`$${objectName}`, "hwscript");
      const definition = cache.getObjectDefinition(objectName);
      if (definition) {
        markdown.appendMarkdown(
          `\n\nDefined in: \`${path.basename(definition.sourceFile)}\``
        );
        markdown.appendMarkdown(`\n\n**Properties**:\n`);
        definition.properties.slice(0, 10).forEach((p) => {
          markdown.appendMarkdown(`- \`${p.name}\`: ${p.type}\n`);
        });
      } else if (PREDEFINED_OBJECT_PROPERTY_MAP[objectName]) {
        markdown.appendMarkdown(`\n\nPredefined object`);
      } else {
        markdown.appendMarkdown(`\n\n⚠️ Not defined`);
      }
    }

    return new vscode.Hover(markdown, range);
  }
}

class HaiwellScriptDefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Definition | undefined> {
    const range = document.getWordRangeAtPosition(position, /\$\w+/);
    if (!range) {
      return undefined;
    }

    const text = document.getText(range);
    const match = text.match(/\$(\w+)/);
    if (!match) {
      return undefined;
    }

    const objectName = match[1];
    const cache = ProjectObjectCache.getInstance();
    const definition = cache.getObjectDefinition(objectName);

    if (definition) {
      const uri = vscode.Uri.file(definition.sourceFile);
      return new vscode.Location(uri, new vscode.Position(0, 0));
    }

    return undefined;
  }
}

class HaiwellScriptDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.DocumentSymbol[] {
    const symbols: vscode.DocumentSymbol[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);

      const functionMatch = line.text.match(/function\s+(\w+)\s*\(/);
      if (functionMatch) {
        symbols.push(
          new vscode.DocumentSymbol(
            functionMatch[1],
            "Function",
            vscode.SymbolKind.Function,
            line.range,
            line.range
          )
        );
      }

      const varMatch = line.text.match(/\b(var|let|const)\s+(\w+)\s*=/);
      if (varMatch) {
        symbols.push(
          new vscode.DocumentSymbol(
            varMatch[2],
            "Variable",
            vscode.SymbolKind.Variable,
            line.range,
            line.range
          )
        );
      }
    }

    return symbols;
  }
}

export function deactivate(): void {
  ProjectObjectCache.getInstance().clear();
}
