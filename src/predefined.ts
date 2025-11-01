import { make_type, PropertyInfo, VariableInfo } from "./types";

export const PREDEFINED_OBJECTS: {
    [key: string]: PropertyInfo[];
} = {
    Common: [
        {
            name: "freeProtocol",
            type: make_type.Object({
                write: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                readSpecificLength: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                readLastMillisecond: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
            }),
            rawType: "FUNCTION",
        },
        {
            name: "memory",
            type: make_type.Object({
                alloc: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                concat: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                fromUTF8: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                crc16Modulebus: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
            }),
            rawType: "FUNCTION",
        },
        {
            name: "database",
            type: make_type.Object({
                createDatabase: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                deleteDatabase: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                flush: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                getDatabaseFiles: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                exec: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                execTransaction: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                get: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                query: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
            }),
            rawType: "FUNCTION",
        },
        {
            name: "logger",
            type: make_type.Object({
                log: make_type.Function(["fmt: string"]),
                debug: make_type.Function(["fmt: string"]),
                info: make_type.Function(["fmt: string"]),
                trace: make_type.Function(["fmt: string"]),
                warn: make_type.Function(["fmt: string"]),
                error: make_type.Function(["fmt: string"]),
                note: make_type.Function(["fmt: string"]),
            }),
            rawType: "FUNCTION",
        },
        {
            name: "crypto",
            type: make_type.Object({
                createHash: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                createHmac: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                createCipher: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                createDecipher: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                createCipheriv: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                createDecipheriv: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                createSign: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
                createVerify: make_type.Function([], {
                    description: "**NOTE**: backend only",
                }),
            }),
            rawType: "FUNCTION",
        },

        {
            name: "MobileBarcodescanner",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "Format",
            type: make_type.Function(["num: number", "type_str: string"]),
            rawType: "FUNCTION",
        },

        {
            name: "ConvertToBase",
            type: make_type.Function(["value", "radix"]),
            rawType: "FUNCTION",
        },
        {
            name: "ConvertFromBase",
            type: make_type.Function(["value", "radix"]),
            rawType: "FUNCTION",
        },
        { name: "Local", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "SetTimeout",
            type: make_type.Function(["callback", "times"]),
            rawType: "FUNCTION",
        },
        {
            name: "SetInterval",
            type: make_type.Function(["callback", "times"]),
            rawType: "FUNCTION",
        },
        {
            name: "Log",
            type: make_type.Function(["content"]),
            rawType: "FUNCTION",
        },
        {
            name: "Beep",
            type: make_type.Function(["myOnTime", "myOffTime", "myRepeat"]),
            rawType: "FUNCTION",
        },
        { name: "BeepStart", type: make_type.Function(), rawType: "FUNCTION" },
        { name: "BeepEnd", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "PausePlayback",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "RTCurveCtrl",
            type: make_type.Function(["state"]),
            rawType: "FUNCTION",
        },
        { name: "LoadBarLib", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "ShowBarCode",
            type: make_type.Function(["eleId", "content"]),
            rawType: "FUNCTION",
        },
        {
            name: "sysPrint",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "sysReboot",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "SocketSend",
            type: make_type.Function(["options", "element"]),
            rawType: "FUNCTION",
        },
        {
            name: "SocketSendWithOpLog",
            type: make_type.Function(["options", "element"]),
            rawType: "FUNCTION",
        },
        {
            name: "GetSend",
            type: make_type.Function(["options", "url"]),
            rawType: "FUNCTION",
        },
        {
            name: "Ajax",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "execChange",
            type: make_type.Function([
                "commumType",
                "winId",
                "eleIds",
                "options",
            ]),
            rawType: "FUNCTION",
        },
        {
            name: "IntoNetwork",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        { name: "Setting", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "SystemSetting",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        { name: "testEnd", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "CalcColor",
            type: make_type.Function(["color", "level"]),
            rawType: "FUNCTION",
        },
        {
            name: "ConfirmBox",
            type: make_type.Function(["confirmText", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "CloudInfoBox",
            type: make_type.Function(["type", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "GetAlarm",
            type: make_type.Function(["alarmFormat"]),
            rawType: "FUNCTION",
        },
        {
            name: "RST",
            type: make_type.Function(["value", "index"]),
            rawType: "FUNCTION",
        },
        {
            name: "INV",
            type: make_type.Function(["value", "index"]),
            rawType: "FUNCTION",
        },
        {
            name: "SET",
            type: make_type.Function(["value", "index"]),
            rawType: "FUNCTION",
        },
        {
            name: "MsgBox",
            type: make_type.Function(["content", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "Quit",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        { name: "Bee", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "controlCameraDown",
            type: make_type.Function(["camid", "direction", "symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "controlCameraUp",
            type: make_type.Function(["camid", "direction", "symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "cameraSnapshot",
            type: make_type.Function(["camid", "symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "CloseModal",
            type: make_type.Function(["ID", "symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "GetBit",
            type: make_type.Function(["val", "index"]),
            rawType: "FUNCTION",
        },
        {
            name: "GetBits",
            type: make_type.Function(["val"]),
            rawType: "FUNCTION",
        },
        {
            name: "ArrayToValue",
            type: make_type.Function(["bits"]),
            rawType: "FUNCTION",
        },
        {
            name: "uint8Array2uint16Array",
            type: make_type.Function(["uint8Array"]),
            rawType: "FUNCTION",
        },
        {
            name: "uint16Array2uint8Array",
            type: make_type.Function(["uint16Array"]),
            rawType: "FUNCTION",
        },
        {
            name: "utf8ToGbk",
            type: make_type.Function(["utf8Str"]),
            rawType: "FUNCTION",
        },
        {
            name: "gbkToUtf8",
            type: make_type.Function(["gbkBuffer"]),
            rawType: "FUNCTION",
        },
        {
            name: "BoolToInt",
            type: make_type.Function(["bool"]),
            rawType: "FUNCTION",
        },
        {
            name: "IntToBool",
            type: make_type.Function(["int"]),
            rawType: "FUNCTION",
        },
        {
            name: "BitAnd",
            type: make_type.Function(["x", "y"]),
            rawType: "FUNCTION",
        },
        {
            name: "BackTask",
            type: make_type.Function(["id", "element"]),
            rawType: "FUNCTION",
        },
        {
            name: "RecipeToPlcByGroupNo",
            type: make_type.Function(["options", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "RecipePlcSaveByGroupNo",
            type: make_type.Function(["options", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "RecipeToPlcByGroupName",
            type: make_type.Function(["options", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "RecipePlcSaveByGroupName",
            type: make_type.Function(["options", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "historyRecordCsv",
            type: make_type.Function(["query", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "recipeRecordCsv",
            type: make_type.Function(["query", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "alarmRecordCsv",
            type: make_type.Function(["query", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "graphicAudioPlay",
            type: make_type.Function(["element", "stage"]),
            rawType: "FUNCTION",
        },
        {
            name: "SendKey",
            type: make_type.Function(["keyCode"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "AddFile",
            type: make_type.Function(["fileName", "filePath"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "ReadFile",
            type: make_type.Function(["filePath"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "WriteFile",
            type: make_type.Function(["filePath", "data"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "RenameFile",
            type: make_type.Function(["oldName", "newName", "filePath"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "DeleteFile",
            type: make_type.Function(["filePath"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "GetRecipeGroupNum",
            type: make_type.Function(["options", "callback"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "AddRecipeGroup",
            type: make_type.Function(["options", "callback"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "DeleteRecipeGroup",
            type: make_type.Function(["options", "callback"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "PrintText",
            type: make_type.Function(["name", "text"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "PrintLine",
            type: make_type.Function(["name", "arr"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "getConnected",
            type: make_type.Function([], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "publish",
            type: make_type.Function(["topic", "message", "opts", "callback"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "BufferCreate",
            type: make_type.Function(["zoneCode", "zoneLen"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "BufferGetAt",
            type: make_type.Function(["zoneCode", "zoneLen"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "BufferSetAt",
            type: make_type.Function(["zoneCode", "zoneLen", "data"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "BufferStoreToFile",
            type: make_type.Function(["zoneCode", "fileName", "callback"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "BufferLoadFromFile",
            type: make_type.Function(["zoneCode", "fileName", "callback"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "DelDataGroup",
            type: make_type.Function(["callback", "options"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "DelAlertRecord",
            type: make_type.Function(["callback", "options"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "DelHistoryRecord",
            type: make_type.Function(["callback", "options"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "CreateOrOpenDatabase",
            type: make_type.Function(["type", "databasePath", "cb"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "CloseDatabase",
            type: make_type.Function(["type", "databasePath", "cb"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "DeleteDatabase",
            type: make_type.Function(["type", "databasePath", "cb"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "QueryDatabase",
            type: make_type.Function(
                ["type", "databasePath", "sql", "sucCallback", "cb"],
                { description: "**NOTE**: empty definition" }
            ),
            rawType: "FUNCTION",
        },
        {
            name: "TraQueryDatabase",
            type: make_type.Function(
                ["curDataBase", "sql", "sucCallback", "callback"],
                { description: "**NOTE**: empty definition" }
            ),
            rawType: "FUNCTION",
        },
        {
            name: "RunDatabase",
            type: make_type.Function(
                ["type", "databasePath", "sql", "sucCallback", "cb"],
                { description: "**NOTE**: empty definition" }
            ),
            rawType: "FUNCTION",
        },
        {
            name: "TraRunDatabase",
            type: make_type.Function(
                ["curDataBase", "sql", "sucCallback", "callback"],
                { description: "**NOTE**: empty definition" }
            ),
            rawType: "FUNCTION",
        },
        {
            name: "ExecDatabase",
            type: make_type.Function(
                ["type", "databasePath", "sqlMore", "sucCallback", "cb"],
                { description: "**NOTE**: empty definition" }
            ),
            rawType: "FUNCTION",
        },
        {
            name: "TraExecDatabase",
            type: make_type.Function(
                ["curDataBase", "sql", "sucCallback", "callback"],
                { description: "**NOTE**: empty definition" }
            ),
            rawType: "FUNCTION",
        },
        {
            name: "TraStaDatabase",
            type: make_type.Function(["curDataBase"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "CommitDatabase",
            type: make_type.Function(["curDataBase"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "RollBackDatabase",
            type: make_type.Function(["curDataBase"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "TarnRunDatabase",
            type: make_type.Function(["type", "databasePath", "callback"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "CopyDatabase",
            type: make_type.Function(
                [
                    "sourceType",
                    "sourceDatabasePath",
                    "targetType",
                    "targetDatabasePath",
                    "cb",
                ],
                { description: "**NOTE**: empty definition" }
            ),
            rawType: "FUNCTION",
        },
    ],
    Window: [
        {
            name: "AppScanCode",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "WebIframe",
            type: make_type.Function(["root", "option"]),
            rawType: "FUNCTION",
        },
        {
            name: "UpdateFile",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "TimeInputSet",
            type: make_type.Function(["options", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "logOperationInfo",
            type: make_type.Function(["info"]),
            rawType: "FUNCTION",
        },
        {
            name: "getOperationInfo",
            type: make_type.Function(["element", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "operationLog",
            type: make_type.Function(["container"]),
            rawType: "FUNCTION",
        },
        {
            name: "FileList",
            type: make_type.Function(["root", "option"]),
            rawType: "FUNCTION",
        },
        {
            name: "BarChart",
            type: make_type.Function(["type", "root", "option"]),
            rawType: "FUNCTION",
        },
        {
            name: "XyCurve",
            type: make_type.Function(["root", "option"]),
            rawType: "FUNCTION",
        },
        {
            name: "PrintPic",
            type: make_type.Function(["option"]),
            rawType: "FUNCTION",
        },
        {
            name: "PDFPel",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "RealTimeCurve",
            type: make_type.Function(["root", "option", "curve"]),
            rawType: "FUNCTION",
        },
        {
            name: "HistoryCurve",
            type: make_type.Function(["res", "option"]),
            rawType: "FUNCTION",
        },
        {
            name: "getLang",
            type: make_type.Function(["value"]),
            rawType: "FUNCTION",
        },
        {
            name: "userGroupEdit",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "DataList",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "GetCurrentFrameId",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "ExportData",
            type: make_type.Function([
                "type",
                "position",
                "filePath",
                "fileFormat",
                "element",
            ]),
            rawType: "FUNCTION",
        },
        {
            name: "sendActivityFrame",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "Weather",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        { name: "getSysLang", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "QRCode",
            type: make_type.Function(["callback"]),
            rawType: "FUNCTION",
        },
        { name: "GetSysTime", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "GetSysTimeDate",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "TimeSelect",
            type: make_type.Function(["options", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "TimeSet",
            type: make_type.Function(["options", "callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "Select",
            type: make_type.Function(["options", "callback", "element"]),
            rawType: "FUNCTION",
        },
        {
            name: "Table",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "RecipeGroup",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "RecipeEditTableBox",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "RecipeEditRowClass",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "Search",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "Loading",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "Notification",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "GoToUrl",
            type: make_type.Function(["url"]),
            rawType: "FUNCTION",
        },
        {
            name: "CameraFrame",
            type: make_type.Function(["options", "element"]),
            rawType: "FUNCTION",
        },
        {
            name: "CameraWebRTC",
            type: make_type.Function(["options", "currentElement"]),
            rawType: "FUNCTION",
        },
        {
            name: "getStorageCamera",
            type: make_type.Function(["symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "setStorageCamera",
            type: make_type.Function(["DeviceSerial", "info"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowById",
            type: make_type.Function([
                "id",
                "subLocation",
                "isSystemWinNoChanged",
                "isLocalOnload",
            ]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowScreenSaverById",
            type: make_type.Function(["id"]),
            rawType: "FUNCTION",
        },
        {
            name: "HideById",
            type: make_type.Function(["id"]),
            rawType: "FUNCTION",
        },
        {
            name: "Show",
            type: make_type.Function(["name", "element"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowByNo",
            type: make_type.Function([
                "number",
                "subLocation",
                "isSystemWinNoChanged",
            ]),
            rawType: "FUNCTION",
        },
        {
            name: "HideByNo",
            type: make_type.Function(["number"]),
            rawType: "FUNCTION",
        },
        {
            name: "ClearData",
            type: make_type.Function(["type", "element"]),
            rawType: "FUNCTION",
        },
        {
            name: "PopClose",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowSymbol",
            type: make_type.Function(["winName", "symbolName"]),
            rawType: "FUNCTION",
        },
        {
            name: "HideSymbol",
            type: make_type.Function(["winName", "symbolName"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowElement",
            type: make_type.Function(["winId", "symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "HideElement",
            type: make_type.Function(["winId", "symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowPaymentInfo",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "Login",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "LoginModal",
            type: make_type.Function(["usernames", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "DialogBox",
            type: make_type.Function(["usernames", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "Logout",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowSubByNo",
            type: make_type.Function(["currentElement", "No"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowSubById",
            type: make_type.Function(["currentElement", "Id"]),
            rawType: "FUNCTION",
        },
        {
            name: "HideSub",
            type: make_type.Function(["currentElement"]),
            rawType: "FUNCTION",
        },
        {
            name: "PopSubById",
            type: make_type.Function(["id", "options", "x", "y", "hashBoard"]),
            rawType: "FUNCTION",
        },
        {
            name: "PopSubByNo",
            type: make_type.Function(["No", "options", "x", "y"]),
            rawType: "FUNCTION",
        },
        {
            name: "Toast",
            type: make_type.Function(["context", "mill", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "Popupbox",
            type: make_type.Function(["context", "mill", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "PayModal",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "CloseModal",
            type: make_type.Function(["ID", "symId"]),
            rawType: "FUNCTION",
        },
        {
            name: "CloseModalByElement",
            type: make_type.Function(["classModal"]),
            rawType: "FUNCTION",
        },
        {
            name: "CloseAlarmModalElement",
            type: make_type.Function(["el"]),
            rawType: "FUNCTION",
        },
        {
            name: "updataAlertModeLang",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "TestModal",
            type: make_type.Function(["context", "mill", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "createStyleSheet",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "Ezuikit",
            type: make_type.Function(["callback"]),
            rawType: "FUNCTION",
        },
        {
            name: "Highcharts",
            type: make_type.Function(["options", "chartOpt"]),
            rawType: "FUNCTION",
        },
        {
            name: "FileModal",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "DeviceModal",
            type: make_type.Function(["options"]),
            rawType: "FUNCTION",
        },
        {
            name: "PopModalById",
            type: make_type.Function(["id", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "PopKeyboard",
            type: make_type.Function(["type", "callback", "options"]),
            rawType: "FUNCTION",
        },
        {
            name: "onloadWindow",
            type: make_type.Function(["winId", "eleIds"]),
            rawType: "FUNCTION",
        },
        {
            name: "onShowWindow",
            type: make_type.Function(["winId", "eleIds"]),
            rawType: "FUNCTION",
        },
        {
            name: "onHideWindow",
            type: make_type.Function(["winId", "eleIds"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowFirstWindow",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowLastWindow",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowNextWindow",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowPreviousWindow",
            type: make_type.Function(["element"]),
            rawType: "FUNCTION",
        },
        {
            name: "DisplaySync",
            type: make_type.Function(["value"]),
            rawType: "FUNCTION",
        },
        {
            name: "CloseCamVoice",
            type: make_type.Function(),
            rawType: "FUNCTION",
        },
        {
            name: "selectExportDb",
            type: make_type.Function(["data"]),
            rawType: "FUNCTION",
        },
        {
            name: "ElementBelongWin",
            type: make_type.Function(["symId", "curWinId"]),
            rawType: "FUNCTION",
        },
        { name: "IsTvbox", type: make_type.Function(), rawType: "FUNCTION" },
        {
            name: "numColChg",
            type: make_type.Function(["winId", "symId", "numValue"]),
            rawType: "FUNCTION",
        },
        {
            name: "strToutf8",
            type: make_type.Function(["str"]),
            rawType: "FUNCTION",
        },
        {
            name: "strTounicode",
            type: make_type.Function(["text"]),
            rawType: "FUNCTION",
        },
        {
            name: "exchange",
            type: make_type.Function(["str"]),
            rawType: "FUNCTION",
        },
        {
            name: "ShowWindowById",
            type: make_type.Function([
                "number",
                "subLocation",
                "isSystemWinNoChanged",
            ]),
            rawType: "FUNCTION",
        },
        {
            name: "HideWindowById",
            type: make_type.Function(["number"]),
            rawType: "FUNCTION",
        },
        {
            name: "Clipboard",
            type: make_type.Function(["type", "options"], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
        {
            name: "historyTableExport",
            type: make_type.Function([], {
                description: "**NOTE**: empty definition",
            }),
            rawType: "FUNCTION",
        },
    ],
    Math: [
        { name: "random", type: make_type.Function(), rawType: "FUNCTION" },
        { name: "floor", type: make_type.Function(), rawType: "FUNCTION" },
    ],
};

export const PREDEFINED_VARIABLES: { [key: string]: VariableInfo } = {
    Volume: {
        type: make_type.Number(),
        rawType: "INT",
        description: "Volume adjustment(Range: 0-100)",
    },
    MuteVolume: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Mute Volume (0: OFF, 1: ON)",
    },
    UserName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "User name",
    },
    UserGroup: {
        type: make_type.String(),
        rawType: "STRING",
        description: "User group",
    },
    UserPrivilegeLevel: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Group permissions",
    },
    TimeControl: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "0: Manual setting 1: Network timing",
    },
    Year: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The year of local time (range: 2000-2036),format:20xx",
    },
    Month: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The month of local time (range: 01-12)",
    },
    Day: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The day of local time (range: 01-31)",
    },
    Hour: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The hour of local time (range: 0-23)",
    },
    Minute: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The minute of local time (range: 0-59)",
    },
    Second: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The second of local time(range: 0-59)",
    },
    Week: {
        type: make_type.Number(),
        rawType: "INT",
        description: "The week of system date (range: 0-6)",
    },
    Date: {
        type: make_type.String(),
        rawType: "STRING",
        description: "System date",
    },
    Time: {
        type: make_type.String(),
        rawType: "STRING",
        description: "System time",
    },
    TerminalName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Display the terminal name",
    },
    TerminalCode: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Display the terminal code",
    },
    TerminalPn: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Display the terminal PN code",
    },
    SoftwareVersion1: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 1st byte of firmware version, for example 3 in the 3.24.1.25",
    },
    SoftwareVersion2: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 2nd byte of firmware version, for example 24 in the 3.24.1.25",
    },
    SoftwareVersion3: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 3rd byte of firmware version, for example 1 in the 3.24.1.25",
    },
    SoftwareVersion4: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the 4th byte of firmware version, for example 25 in the 3.24.1.25",
    },
    BuzzerSw: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "0: not enabled; 1: enabled",
    },
    ScreenLux: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Screen luminance (range: 20~100)",
    },
    ScreenSaverTime: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Set up screen saver timeout (s) , 0: Disable screen saver.",
    },
    TimeBetweenClicksScreen: {
        type: make_type.Number(),
        rawType: "Long",
        description:
            "Displays how long the current touch screen has not been clicked, using decimal unsigned double word (numeric parts). Note: Whichever user clicks on the screen will reset the register.",
    },
    ScreenBacklightCtrl: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description:
            "0: The touch screen backlight is OFF 1: The touch screen backlight is ON",
    },
    TouchStatus: {
        type: make_type.Number(),
        rawType: "INT",
        description:
            "0: No tapping on screen, 1: Tapping on screen, 2: Long press on screen",
    },
    RestartDevice: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "1: Restart device",
    },
    DualEthernetType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Support dual network port, 0: NO, 1: YES",
    },
    WiFiType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Support WiFi, 0: NO, 1: YES",
    },
    _4GType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Support 4G, 0: NO, 1: YES",
    },
    UFreeSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Free space of USB flash driver. (Unit: Mbyte)",
    },
    SysFreeSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Free space of system. (Unit: Mbyte)",
    },
    LocalTotalSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Total space of local storage. (Unit: Mbyte)",
    },
    LocalFreeSpace: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "Free space of local storage. (Unit: Mbyte)",
    },
    RecipeuploadHint: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Recipe uploads succesfully prompt, 0: hint, 1: not hint",
    },
    RecipedownloadHint: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description:
            "Recipe downloads succesfully prompt, 0: hint, 1: not hint",
    },
    ProjectName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project name",
    },
    ProjectMemo: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project description",
    },
    ProjectFullName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project file path",
    },
    ProjectCompany: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Company name",
    },
    ProjectAuthor: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project author",
    },
    ProjectCopyright: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Project copyright",
    },
    ProjectLanguageId: {
        type: make_type.Number(),
        rawType: "INT",
        description: "Set up language ID",
    },
    ShowWindowId: {
        type: make_type.Number(),
        rawType: "INT",
        description: "The ID of display",
    },
    RunTime: {
        type: make_type.String(),
        rawType: "STRING",
        description: "The running time of device",
    },
    RunSecond: {
        type: make_type.Number(),
        rawType: "Long",
        description: "The running time of device in second",
    },
    StartDateTime: {
        type: make_type.String(),
        rawType: "STRING",
        description: "The time when device starts running",
    },
    LAN1IP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN1 IP address",
    },
    LAN1IP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN1 IP address",
    },
    LAN1IP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN1 IP address",
    },
    LAN1IP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN1 IP address",
    },
    LAN1mask1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN1 subnet mask",
    },
    LAN1mask2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN1 subnet mask",
    },
    LAN1mask3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN1 subnet mask",
    },
    LAN1mask4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN1 subnet mask",
    },
    LAN1Gateway1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN1 grateway IP address",
    },
    LAN1Gateway2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN1 grateway IP address",
    },
    LAN1Gateway3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN1 grateway IP address",
    },
    LAN1Gateway4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN1 grateway IP address",
    },
    DNSP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of Preferred DNS IP address",
    },
    DNSP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of Preferred DNS IP address",
    },
    DNSP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of Preferred DNS IP address",
    },
    DNSP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of Preferred DNS IP address",
    },
    LAN1MAC1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte LAN1 MAC address",
    },
    LAN1MAC2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte LAN1 MAC address",
    },
    LAN1MAC3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte LAN1 MAC address",
    },
    LAN1MAC4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte LAN1 MAC address",
    },
    LAN1MAC5: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 5th byte LAN1 MAC address",
    },
    LAN1MAC6: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 6th byte LAN1 MAC address",
    },
    WifiSignalStrength: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "WiFi signal strength (range 0~4)",
    },
    _4GSignalStrength: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G signal strength (range 0~5)",
    },
    SIMCardNumber: {
        type: make_type.String(),
        rawType: "STRING",
        description: "The SIM card number",
    },
    _4G: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "4G 0:OFF 1:ON",
    },
    SIMICCID: {
        type: make_type.String(),
        rawType: "STRING",
        description:
            "Display the ICCID information of the inserted SIM card on the device.",
    },
    ESIMICCID: {
        type: make_type.String(),
        rawType: "STRING",
        description:
            "Display the ICCID information of the inserted eSIM card on the device.",
    },
    CurrentSIMType: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the current type of SIM type being used by the device.0:None,1:eSIM,2:SIM",
    },
    _4GModel: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Display the current 4G Model.0:Force to use eSIM,1:Force to use SIM",
    },
    _4GDNSIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 1th byte of the DNS IP address",
    },
    _4GDNSIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 2th byte of the DNS IP address",
    },
    _4GDNSIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 3th byte of the DNS IP address",
    },
    _4GDNSIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "4G card the 4th byte of the DNS IP address",
    },
    _4GDNSConfiguration: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "DNS configuration of 4G card (0:Static IP 1:DHCP)",
    },
    Modify4GcardDNS: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1,update the IP information of 4G card DNS",
    },
    LAN1NetworkType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "The network type of LAN1 (0:Static IP 1:DHCP)",
    },
    ModifyLAN1: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1, update the IP information of LAN1",
    },
    WiFiIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi IP address",
    },
    WiFiIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi IP address",
    },
    WiFiIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi IP address",
    },
    WiFiIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi IP address",
    },
    WiFimask1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi subnet mask",
    },
    WiFimask2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi subnet mask",
    },
    WiFimask3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi subnet mask",
    },
    WiFimask4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi subnet mask",
    },
    WiFiGateway1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi grateway IP address",
    },
    WiFiGateway2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi grateway IP address",
    },
    WiFiGateway3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi grateway IP address",
    },
    WiFiGateway4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi grateway IP address",
    },
    WiFiDNSIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of WiFi DNS IP address",
    },
    WiFiDNSIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte of WiFi DNS IP address",
    },
    WiFiDNSIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte of WiFi DNS IP address",
    },
    WiFiDNSIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte of WiFi DNS IP address",
    },
    WiFiMAC1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte WiFi MAC address",
    },
    WiFiMAC2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2st byte WiFi MAC address",
    },
    WiFiMAC3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3st byte WiFi MAC address",
    },
    WiFiMAC4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4st byte WiFi MAC address",
    },
    WiFiMAC5: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 5st byte WiFi MAC address",
    },
    WiFiMAC6: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 6st byte WiFi MAC address",
    },
    WiFiNetworkType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "The network type of WiFi (0:Static IP  1:DHCP)",
    },
    ModifyWiFi: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1, update the IP information of WiFi",
    },
    LAN2IP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN2 IP address",
    },
    LAN2IP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN2 IP address",
    },
    LAN2IP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN2 IP address",
    },
    LAN2IP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN2 IP address",
    },
    LAN2mask1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN2 subnet mask",
    },
    LAN2mask2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN2 subnet mask",
    },
    LAN2mask3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN2 subnet mask",
    },
    LAN2mask4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN2 subnet mask",
    },
    LAN2Gateway1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte of LAN2 grateway IP address",
    },
    LAN2Gateway2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte of LAN2 grateway IP address",
    },
    LAN2Gateway3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte of LAN2 grateway IP address",
    },
    LAN2Gateway4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte of LAN2 grateway IP address",
    },
    LAN2DNSIP1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 1",
    },
    LAN2DNSIP2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 2",
    },
    LAN3DNSIP3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 3",
    },
    LAN2DNSIP4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "LAN2 DNS IP address 4",
    },
    LAN2MAC1: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 1st byte LAN2 MAC address",
    },
    LAN2MAC2: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 2nd byte LAN2 MAC address",
    },
    LAN2MAC3: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 3rd byte LAN2 MAC address",
    },
    LAN2MAC4: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 4th byte LAN2 MAC address",
    },
    LAN2MAC5: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 5th byte LAN2 MAC address",
    },
    LAN2MAC6: {
        type: make_type.Number(),
        rawType: "UINT",
        description: "The 6th byte LAN2 MAC address",
    },
    ModifyLAN2: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Set to 1, update the IP information of LAN2",
    },
    LAN2NetworkType: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "The network type of LAN2 (0:Static IP 1:DHCP)",
    },
    EthernetPortMode: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "Ethernet port mode (0:DHCP 1:Static IP)",
    },
    LAN1: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "LAN1 switch, 0: off, 1: on",
    },
    LAN2: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "LAN2 switch, 0: off, 1: on",
    },
    WiFi: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "WiFi switch, 0: off, 1: on",
    },
    CloudOnline: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "0: Offline; 1: Online",
    },
    A_ProductKey: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Product key",
    },
    A_ProductSecret: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Product secret key",
    },
    A_DeviceName: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Device name. Range: 4-32",
    },
    A_ClientID: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Alibaba Cloud client ID",
    },
    A_Username: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Alibaba Cloud username",
    },
    A_DeviceToken: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Alibaba Cloud user password",
    },
    A_Register: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Register the device, 0:Ready 1:Register 2:Reset 3:Re-register",
    },
    A_RegistrationResult: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Registration result,0:disable dynamic registation 1:unregistered 2:registering 3: registration failed 4: registration successful",
    },
    A_ConnectionStatus: {
        type: make_type.Number(),
        rawType: "UINT",
        description:
            "Connection ID: 0: Not connected 1: Connecting 2: Connection failed 3: Connection successful",
    },
    Longitude: {
        type: make_type.Number(),
        rawType: "Float",
        description: "The longitude of the current device",
    },
    Latitude: {
        type: make_type.Number(),
        rawType: "Float",
        description: "The latitude of the current devicee",
    },
    ReadPosition: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description:
            "Control whether to read the latitude and longitude of the device (0: Don't read,  1: Read)",
    },
    ReadPositionInterval: {
        type: make_type.Number(),
        rawType: "ULong",
        description: "Latitude and longitude acquisition frequency",
    },
    LongitudeLatitude: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Latitude and longitude of equipment",
    },
    LongitudeDirection: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Longtitude direction.E:East,W:West",
    },
    LatitudeDirection: {
        type: make_type.String(),
        rawType: "STRING",
        description: "Latitude direction.N:North,S:South",
    },
    GroundSpeed: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Ground speed",
    },
    CourseOverGround: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Course over ground",
    },
    Elevation: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Elevation",
    },
    GPSState: {
        type: make_type.Boolean(),
        rawType: "BOOL",
        description: "GPS State",
    },
    GPSSignalStrength: {
        type: make_type.Number(),
        rawType: "INT",
        description:
            "GPS signal strength: 0: no signal, 1: weak, 2: medium, 3: strong",
    },
    NauticalMile: {
        type: make_type.Number(),
        rawType: "Float",
        description: "Navigation speed, unit: nautical miles per hour",
    },
};
