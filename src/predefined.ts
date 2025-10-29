import { ObjectPropertyMap } from "./types";

export const PREDEFINED_OBJECT_PROPERTY_MAP: ObjectPropertyMap = {
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