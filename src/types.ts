/**
 * Type definitions for Haiwell Script Extension
 */


export interface ObjectPropertyMap {
    [key: string]: PropertyInfo[];
}

export interface VariableInfo {
    type: string;
    rawType?: string;
    // optional source line in the CSV (1-based)
    sourceLine?: number;
    // optional human readable description from CSV
    description?: string;
    // optional string length for string-like types
    stringLength?: number;
}

export interface PropertyInfo {
    name: string;
    type: string;
    rawType?: string;
    // optional source line in the CSV (1-based)
    sourceLine?: number;
    // optional human readable description from CSV
    description?: string;
    // optional string length for string-like types
    stringLength?: number;
}

export interface ObjectUsage {
    files: Set<string>;
    properties: Set<string>;
}

export interface VariableDefinition {
    objectName: string;
    properties: PropertyInfo[];
    sourceFile: string;
}

export interface GlobalSymbol {
    name: string;
    kind: "function" | "variable" | "class" | "other";
    sourceFile: string;
}

export interface DollarObjectMatch {
    fullMatch: string;
    objectName: string;
    propertyName?: string;
}

export interface LanguageConfig {
    objectPrefix: string;
    objectSeparator: string;
    fileExtensions: string[];
}

export const DEFAULT_LANGUAGE_CONFIG: LanguageConfig = {
    objectPrefix: '$',
    objectSeparator: '.',
    fileExtensions: ['.hws', '.hwscript']
};

/**
 * Parser utilities for $Object.property syntax
 */
export class DollarObjectParser {
    private static readonly PATTERN = /\$(\w+)(?:\.(\w+))?/g;

    /**
     * Parse a line of text for $Object references
     */
    static parse(text: string): DollarObjectMatch[] {
        const matches: DollarObjectMatch[] = [];
        let match: RegExpExecArray | null;

        const pattern = new RegExp(this.PATTERN);

        while ((match = pattern.exec(text)) !== null) {
            matches.push({
                fullMatch: match[0],
                objectName: match[1],
                propertyName: match[2]
            });
        }

        return matches;
    }

    /**
     * Check if a position in text is within a $Object reference
     */
    static isInDollarObject(text: string, position: number): DollarObjectMatch | null {
        const matches = this.parse(text);

        for (const match of matches) {
            const startIndex = text.indexOf(match.fullMatch);
            const endIndex = startIndex + match.fullMatch.length;

            if (position >= startIndex && position <= endIndex) {
                return match;
            }
        }

        return null;
    }

    /**
     * Extract all unique object names from text
     */
    static extractObjectNames(text: string): string[] {
        const matches = this.parse(text);
        const uniqueObjects = new Set(matches.map(m => m.objectName));
        return Array.from(uniqueObjects);
    }
}