/**
 * Type definitions for Haiwell Script Extension
 */

import { MarkdownString } from "vscode";

type TypeId =
    | "String"
    | "Number"
    | "Object"
    | "Function"
    | "Boolean"
    | "Any"
    | "Unknown";

export type TypeMetadata = {
    location?: string;
    description?: string;
};

export type FunctionParam = {
    name: string;
    type: string;
    metadata?: TypeMetadata;
};

export type StringType = {
    id: "String";
    value_len?: number;
    metadata?: TypeMetadata;
};

export type NumberType = { id: "Number"; metadata?: TypeMetadata };

export type FunctionType = {
    id: "Function";
    params?: FunctionParam[];
    metadata?: TypeMetadata;
};

export type BooleanType = { id: "Boolean"; metadata?: TypeMetadata };

export type AnyType = { id: "Any"; metadata?: TypeMetadata };

export type UnknownType = {
    id: "Unknown";
    str?: string;
    metadata?: TypeMetadata;
};

export type ObjectType = {
    id: "Object";
    child?: PropertyInfo[];
    metadata?: TypeMetadata;
};

export type ValueType =
    | StringType
    | NumberType
    | ObjectType
    | FunctionType
    | BooleanType
    | AnyType
    | UnknownType;

function id_type(id: TypeId): ValueType {
    return {
        id: id,
    };
}

export const make_type = {
    Number: (metadata?: TypeMetadata): ValueType => id_type("String"),
    Boolean: (metadata?: TypeMetadata): ValueType => id_type("Boolean"),
    Any: (metadata?: TypeMetadata): ValueType => id_type("Any"),

    Unknown: (str?: string, metadata?: TypeMetadata): ValueType => {
        return {
            id: "Unknown",
            str: str,
            metadata: metadata,
        };
    },

    String: (length?: number, metadata?: TypeMetadata): ValueType => {
        return {
            id: "String",
            value_len: length,
            metadata: metadata,
        };
    },

    Object: (
        child: { [key: string]: ValueType },
        metadata?: TypeMetadata
    ): ValueType => {
        const out = Object.entries(child).map(([k, v]) => {
            return {
                name: k,
                type: v,
            };
        });

        return {
            id: "Object",
            child: out,
            metadata: metadata,
        };
    },

    Function: (params?: string[], metadata?: TypeMetadata): ValueType => {
        if (params === undefined || params.length === 0) {
            return { id: "Function", metadata: metadata };
        }

        const p = params.map((p): FunctionParam => {
            let [n, t] = p.split(":");
            t = typeof t === "undefined" ? "any" : t.trim();
            n = n.trim();

            return {
                name: n,
                type: t,
            };
        });

        return {
            id: "Function",
            params: p,
            metadata: metadata,
        };
    },
};

export interface VariableInfo {
    type: ValueType;
    description?: string;
    rawType?: string;
    // optional source line in the CSV (1-based)
    sourceLine?: number;
    // optional human readable description from CSV
}

export interface PropertyInfo {
    name: string;
    type: ValueType;
    description?: string;
    rawType?: string;
    // optional source line in the CSV (1-based)
    sourceLine?: number;
    // optional human readable description from CSV
}

// export interface DollarObjectMatch {
//     fullMatch: string;
//     objectName: string;
//     propertyName?: string;
// }
// /**
//  * Parser utilities for $Object.property syntax
//  */
// export class DollarObjectParser {
//     private static readonly PATTERN = /\$(\w+)(?:\.(\w+))?/g;

//     /**
//      * Parse a line of text for $Object references
//      */
//     static parse(text: string): DollarObjectMatch[] {
//         const matches: DollarObjectMatch[] = [];
//         let match: RegExpExecArray | null;

//         const pattern = new RegExp(this.PATTERN);

//         while ((match = pattern.exec(text)) !== null) {
//             matches.push({
//                 fullMatch: match[0],
//                 objectName: match[1],
//                 propertyName: match[2],
//             });
//         }

//         return matches;
//     }

//     /**
//      * Check if a position in text is within a $Object reference
//      */
//     static isInDollarObject(
//         text: string,
//         position: number
//     ): DollarObjectMatch | null {
//         const matches = this.parse(text);

//         for (const match of matches) {
//             const startIndex = text.indexOf(match.fullMatch);
//             const endIndex = startIndex + match.fullMatch.length;

//             if (position >= startIndex && position <= endIndex) {
//                 return match;
//             }
//         }

//         return null;
//     }

//     /**
//      * Extract all unique object names from text
//      */
//     static extractObjectNames(text: string): string[] {
//         const matches = this.parse(text);
//         const uniqueObjects = new Set(matches.map((m) => m.objectName));
//         return Array.from(uniqueObjects);
//     }
// }
