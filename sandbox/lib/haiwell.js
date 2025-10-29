/* eslint-disable */

export let Common = {
    MobileBarcodescanner: function () {
        console.log("执行脚本");
        //执行app扫码枪
        Window.AppScanCode();
    },

    Format: function (num, typeStr) {
        var regex = new RegExp("\\.", "g"); // 使用g表示整个字符串都要匹配
        var result = typeStr.match(regex); //match方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
        var dotCount = !result ? 0 : result.length;
        if (dotCount > 1) {
            return "";
        }
        for (ch in typeStr) {
            if (typeStr[ch] != "." && typeStr[ch] != "0") {
                return "";
            }
        }
        var intStr = "";
        var dotStr = "";

        if (dotCount == 1) {
            var str = typeStr.split(".");
            intStr = str[0];
            dotStr = str[1];
            if (dotStr.length >= 0) {
                var tempValue = 1;
                for (var i = dotStr.length; i > 0; --i) {
                    tempValue *= 10;
                }
                num = Math.round(num * tempValue) / tempValue;
            }
        } else {
            intStr = typeStr;
        }

        //处理整数部分
        if (intStr != "") {
            var intPart = parseInt(num);
            var times = 1;
            for (var i = 0; i < intStr.length; i++) {
                times *= 10;
            }
            var tempStr = (intPart % times).toString();
            intPart = intPart.toString();

            while (tempStr.length < intStr.length) {
                tempStr = "0" + tempStr;
            }
            intStr = tempStr;
        }

        //处理小数点
        if (dotStr != "") {
            var dotPart = num.toString().split(".")[1];
            if (dotPart && dotStr) {
                if (dotPart.length > dotStr.length) {
                    dotStr = dotPart.substring(0, dotStr.length);
                } else if (dotPart.length < dotStr.length) {
                    while (dotPart.length < dotStr.length) {
                        dotPart += "0";
                    }
                    dotStr = dotPart;
                } else {
                    dotStr = dotPart;
                }
            }
        }
        return dotCount == 1 ? intStr + "." + dotStr : intStr;
    },

    ConvertToBase: function (value, radix) {
        return new Number(value).toString(radix);
    },

    ConvertFromBase: function (value, radix) {
        return isNaN(parseInt(value, radix)) ? 0 : parseInt(value, radix);
    },

    Local: function () {
        return indexlocal;
    },

    SetTimeout: function (callback, times) {
        return setTimeout(callback, times);
    },

    SetInterval: function (callback, times) {
        return setInterval(callback, times);
    },

    Log: function (content) {
        console.log(content);
    },

    Beep: function (myOnTime, myOffTime, myRepeat) {
        var dataJson = {
            type: 3,
            onTime: myOnTime,
            offTime: myOffTime,
            repeat: myRepeat,
        };
        socket.emit("BEEPCol", dataJson);
    },

    BeepStart: function () {
        var dataJson = {
            type: 1,
            onTime: 0,
            offTime: 0,
            repeat: 0,
        };
        socket.emit("BEEPCol", dataJson);
    },

    BeepEnd: function () {
        var dataJson = {
            type: 2,
            onTime: 0,
            offTime: 0,
            repeat: 0,
        };
        socket.emit("BEEPCol", dataJson);
    },

    PausePlayback: function () {
        var audioJson = {
            data: "",
            type: 5,
        };
        socket.emit("BEEPCol", audioJson);
    },

    RTCurveCtrl: function (state) {
        if (state) {
            socket.emit("RTCurveCtrl", true);
        } else {
            socket.emit("RTCurveCtrl", false);
        }
    },

    LoadBarLib: function () {
        function loadJs(url, callback) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            if (typeof callback != "undefined") {
                if (script.readyState) {
                    script.onreadystatechange = function () {
                        if (script.readyState == "loaded" || script.readyState == "complete") {
                            script.onreadystatechange = null;
                            callback();
                        }
                    };
                } else {
                    script.onload = function () {
                        callback();
                    };
                }
            }
            var isLinux = String(navigator.platform).indexOf("Linux") > -1;
            script.src = isLinux ? "http://127.0.0.1" + url : url;
            document.body.appendChild(script);
        }
        loadJs("/javascripts/lib/JsBarcode.code128.min.js", function () {
            console.log("JsBarcode.code128.min.js load success");
        });
    },

    ShowBarCode: function (eleId, content) {
        if (typeof JsBarcode != "undefined") {
            if (content != "") {
                var currentElement = document.getElementById(eleId);
                if (currentElement) {
                    JsBarcode("#" + eleId, content);
                }
            } else {
                JsBarcode("#" + eleId, " ");
            }
        }
    },

    sysPrint: function (element) {
        if (
            window.navigator.appVersion.includes("Electron") &&
            window.navigator.userAgent.toLowerCase().indexOf("linux") == -1
        ) {
            const electronre = eval("require")("electron");
            var ipc = electronre.ipcRenderer;
            ipc.send("print");
        } else {
            window.print();
        }
        Window.getOperationInfo(element, function (info) {
            info.DataType = "pic-print";
            Window.logOperationInfo(info);
        });
    },

    sysReboot: function (element) {
        Window.getOperationInfo(element, function (info) {
            socket.emit("sysReboot", info);
        });
    },

    SocketSend: function (options, element) {
        Window.getOperationInfo(element, function (info) {
            options = options || {};
            options.opinfo = info;
            hai.socketio.emit(options);
        });
    },

    SocketSendWithOpLog: function (options, element) {
        Window.getOperationInfo(element, function (info) {
            options.opinfo = info;
            hai.socketio.emit(options);
        });
    },

    GetSend: function (options, url) {
        options = options || {};
        //callback = callback || function () { };
        if (!url) url = "/qianduan";
        hai.get(
            url,
            {
                options: options,
            },

            function (data) {
                // console.log('data1', options);
                options.res = data;
                //寻找对应的通讯脚本
                var communFunction =
                    (options.symId ? Utils.onIdGetAttr(options.symId, "sym-type") + "_" : "") + "onget_" + options["type"];
                var symElement = options.symId ? document.getElementById(options.symId) : undefined;
                if (options["winId"]) {
                    //有winId
                    if (!ProjectScript.frame["frame_" + options["winId"]]) { return; }
                    if (!ProjectScript.frame["frame_" + options["winId"]][communFunction]) { return; }
                    //执行对应的脚本
                    ProjectScript.frame["frame_" + options["winId"]][communFunction](options, "get", symElement);
                } else {
                    //没有winId
                    var i = 0;
                    for (; i < CurrentActivityFrameList.length; i++) {
                        if (!ProjectScript.frame["frame_" + CurrentActivityFrameList[i]]) continue;
                        if (!ProjectScript.frame["frame_" + CurrentActivityFrameList[i]][communFunction]) continue;
                        ProjectScript.frame["frame_" + CurrentActivityFrameList[i]][communFunction](options, "get", symElement);
                    }
                }
                //callback(options);
            }
        );
    },

    Ajax: function (options) {
        if (hai.ajax) {
            hai.ajax(options);
        } else {
            console.error("ajax is not define");
        }
    },

    execChange: function (commumType, winId, eleIds, options) {
        var frameName = "frame_" + winId,
            frameScript = ProjectScript.frame[frameName];
        // console.log(commumType,winId,eleIds,options,'Common execChange');
        //字符串转数组
        eleIds = eleIds.split(",");
        eleIds.map(function (eleId) {
            if (!eleId) { return; }
            var currentElement = document.getElementById(eleId);
            // console.log(currentElement,'currentElement');
            if (!currentElement) { return; }
            //变量名
            var symNameVar = currentElement.GetAttr("sym-type") + "_on" + commumType + "_" + options["type"];
            // console.log(symNameVar,'symNameVar');
            //变量脚本
            symScriptVar = frameScript[symNameVar];
            // console.log(symScriptVar,'symScriptVar');
            if (symScriptVar != undefined) symScriptVar(options, commumType, currentElement);
        });
    },

    IntoNetwork: function () {
        intoNet();
    },

    Setting: function () {
        setting();
    },

    SystemSetting: function () {
        setting();
    },

    SendKey: function (keyCode) { },

    testEnd: function () {
        alert("老化工程结束！");
        if (window.MainPage) MainPage.testEnd();
    },

    CalcColor: function (color, level) {
        return color;
    },

    ConfirmBox: function (confirmText, options) {
        //此函数是浏览器提供 可以将脚本执行停在此处 返回用户选择的 bool类型 然后继续往下执行
        return confirm(confirmText);
        // hai.use('popupbox', function () {
        //     hai.popupbox(confirmText, options);
        //     //title: '我是标题', showCancelButton: true
        // });
    },

    CloudInfoBox: function (type, options) {
        //打开云引擎提示框
        if (type == "start") {
            //判断是否为开启状态
            if (GlobalVar.CloudShowInfo == "") {
                console.log("CloudInfoBox start");
                hai.use("popupbox", function () {
                    if (typeof sysLang.cloudEngineConn != "undefined") {
                        GlobalVar.CloudShowInfo = hai.popupbox(sysLang.cloudEngineConn, options);
                    } else {
                        GlobalVar.CloudShowInfo = hai.popupbox("云引擎联机中...", options);
                    }
                    //title: '我是标题', showCancelButton: true
                });
            }
        } //关闭云引擎提示框
        else {
            GlobalVar.CloudShowInfo.close();
            GlobalVar.CloudShowInfo = "";
        }
    },

    GetAlarm: function (alarmFormat) {
        return RealtimeAlert.ItemsToString(alarmFormat);

        // var backInfo = "";
        // for (var i = 0; i < alarmInfo.length; i++) {

        //     var tempFormat = alarmFormat;

        //     var str = new Array();

        //     str = alarmInfo[i].split(",");

        //     tempFormat = tempFormat.replace(/{AlertTime}/g, str[2]);
        //     tempFormat = tempFormat.replace(/{RecoveryTime}/g, "");
        //     tempFormat = tempFormat.replace(/{Name}/g, variables[str[0]].FullName);
        //     tempFormat = tempFormat.replace(/{VariableMemo}/g, variables[str[0]].Memo);
        //     tempFormat = tempFormat.replace(/{Company}/g, companyName);
        //     tempFormat = tempFormat.replace(/{Value}/g, variables[str[0]].Value);
        //     tempFormat = tempFormat.replace(/{AlertText}/g, str[1]);

        //     backInfo += tempFormat;
        //     backInfo += "|";
        // }
        // if (backInfo != "")
        //     backInfo = backInfo.substring(0, (backInfo.length - 1));
        // //console.log(backInfo;);
        // return backInfo;
    },

    RST: function (value, index) {
        var tempValue = Math.pow(2, index);
        return value & ~tempValue;
    },

    INV: function (value, index) {
        var tempValue = Math.pow(2, index);
        return value ^ tempValue;
    },

    SET: function (value, index) {
        var tempValue = Math.pow(2, index);
        return value | tempValue;
    },

    MsgBox: function (content, options) {
        hai.use("popupbox", function () {
            hai.popupbox(content, options);
        });
    },

    Quit: function (element) {
        Window.getOperationInfo(element, function (info) {
            socket.emit("IPCQuit", info);
        });
        // if (nw && nw.App) {
        //     nw.App.quit();
        // }
    },

    Bee: function () {
        socket.emit("BEE");
    },

    controlCameraDown: function (camid, direction, symId) {
        Common.Bee();
        var speed = 1;
        Common.SocketSend({
            type: "controlCamera",
            control: "start",
            camid: camid,
            direction: direction,
            speed: speed,
            symId: symId,
        });
    },

    controlCameraUp: function (camid, direction, symId) {
        Common.Bee();
        var speed = 1;
        setTimeout(function () {
            Common.SocketSend({
                type: "controlCamera",
                control: "stop",
                camid: camid,
                direction: direction,
                speed: speed,
                symId: symId,
            });
        },
            500);
    },

    cameraSnapshot: function (camid, symId) {
        Common.Bee();
        Common.SocketSend({
            type: "getCamPhoto",
            camid: camid,
            symId: symId,
        });
    },

    CloseModal: function (ID, symId) {
        //关闭字符串生成的模态框
        var modalId = ID ? ID : "HMI_MODAL"; //默认Modal ID 为HMI_MODAL
        if (symId) {
            var sym = document.getElementById(symId);
            var modal = document.getElementById(modalId);
            Common.Bee();
            if (modalId == "RECIPE_MODAL") {
                sym.SelectChild("Clickid", "bomGroupRoot").removeChild(modal);
            } else {
                sym.removeChild(modal);
            }
        } else {
            if (ID.indexOf("tempId") > -1) {
                var curSymId = ID.replace(/tempId/, "");
                var isBeepSound = document.getElementById(curSymId).getAttribute("beep");
                if (!isBeepSound) {
                    Common.Bee();
                }
            } else {
                Common.Bee();
            }
            document.body.removeChild(document.getElementById(modalId));
        }
    },

    GetBit: function (val, index) {
        //获取正整数化为二进制后第N位上的值
        return (val & Math.pow(2, index)) == 0 ? false : true;
    },

    GetBits: function (val) {
        var myBitsArr = new Array();
        for (var i = 0; i < 32; i++) {
            myBitsArr[i] = (val & Math.pow(2, i)) == 0 ? false : true;
        }
        return myBitsArr;
    },

    ArrayToValue: function (bits) {
        var bitVal = false;
        var val = 0;
        for (var i = 0; i < 32; i++) {
            bitVal = bits[i];
            if (typeof bitVal == "undefined") {
                continue;
            }
            if (bitVal) {
                val += Math.pow(2, i);
            }
        }
        return val;
    },

    AddFile: function (fileName, filePath) { },

    uint8Array2uint16Array: function (uint8Array) {
        var uint16Array = new Uint16Array(uint8Array.length / 2);
        for (var i = 0; i < uint8Array.length; i += 2) {
            var value = (uint8Array[i] << 8) | uint8Array[i + 1];
            uint16Array[i / 2] = value;
        }
        return uint16Array;
    },

    uint16Array2uint8Array: function (uint16Array) {
        var uint8Array = new Uint8Array(uint16Array.length * 2);
        for (var i = 0, j = 0; i < uint16Array.length; ++i, j += 2) {
            uint8Array[j] = uint16Array[i] >> 8; // 高位字节
            uint8Array[j + 1] = uint16Array[i] & 0xff; // 低位字节
        }
        return uint8Array;
    },

    utf8ToGbk: function (utf8Str) {
        console.log("仅支持后台运行");
    },

    gbkToUtf8: function (gbkBuffer) {
        console.log("仅支持后台运行");
    },

    ReadFile: function (filePath) { },

    WriteFile: function (filePath, data) { },

    RenameFile: function (oldName, newName, filePath) { },

    DeleteFile: function (filePath) { },

    BoolToInt: function (bool) {
        if (true === bool) {
            return 1;
        } else {
            return 0;
        }
    },

    IntToBool: function (int) {
        if (0 === int) {
            return false;
        } else {
            return true;
        }
    },

    BitAnd: function (x, y) {
        var xtype = typeof x;
        var ytype = typeof y;
        if ("number" != xtype || "number" != ytype) {
            { return; }
        }
        return x & y;
    },

    BufferCreate: function (zoneCode, zoneLen) { },

    BufferGetAt: function (zoneCode, zoneLen) { },

    BufferSetAt: function (zoneCode, zoneLen, data) { },

    BufferStoreToFile: function (zoneCode, fileName, callback) { },

    BufferLoadFromFile: function (zoneCode, fileName, callback) { },

    DelDataGroup: function (callback, options) { },

    DelAlertRecord: function (callback, options) { },

    DelHistoryRecord: function (callback, options) { },

    CreateOrOpenDatabase: function (type, databasePath, cb) { },

    CloseDatabase: function (type, databasePath, cb) { },

    DeleteDatabase: function (type, databasePath, cb) { },

    CopyDatabase: function (sourceType, sourceDatabasePath, targetType, targetDatabasePath, cb) { },

    QueryDatabase: function (type, databasePath, sql, sucCallback, cb) { },

    TraQueryDatabase: function (curDataBase, sql, sucCallback, callback) { },

    RunDatabase: function (type, databasePath, sql, sucCallback, cb) { },

    TraRunDatabase: function (curDataBase, sql, sucCallback, callback) { },

    ExecDatabase: function (type, databasePath, sqlMore, sucCallback, cb) { },

    TraExecDatabase: function (curDataBase, sql, sucCallback, callback) { },

    TraStaDatabase: function (curDataBase) { },

    CommitDatabase: function (curDataBase) { },

    RollBackDatabase: function (curDataBase) { },

    TarnRunDatabase: function (type, databasePath, callback) { },

    BackTask: function (id, element) {
        Window.getOperationInfo(element, function (info) {
            Window.logOperationInfo(info);
            socket.emit("carryOutTheTask", id);
        });
    },

    GetRecipeGroupNum: function (options, callback) { },

    AddRecipeGroup: function (options, callback) { },

    DeleteRecipeGroup: function (options, callback) { },

    RecipeToPlcByGroupNo: function (options, callback) {
        var params = {
            taskName: arguments.callee.name,
            options: options,
        };
        socket.emit("super.task-run", params);
    },

    RecipePlcSaveByGroupNo: function (options, callback) {
        // 转到后端执行 完善超级图元功能
        var params = {
            taskName: arguments.callee.name,
            options: options,
        };
        socket.emit("super.task-run", params);
    },

    RecipeToPlcByGroupName: function (options, callback) {
        // 转到后端执行 完善超级图元功能
        var params = {
            taskName: arguments.callee.name,
            options: options,
        };
        socket.emit("super.task-run", params);
    },

    RecipePlcSaveByGroupName: function (options, callback) {
        // 转到后端执行 完善超级图元功能
        var params = {
            taskName: arguments.callee.name,
            options: options,
        };
        params.options.isSuper = true;
        socket.emit("super.task-run", params);
    },

    historyRecordCsv: function (query, callback) {
        var params = {
            taskName: arguments.callee.name,
            options: {
                id: query.id,
                position: query.position,
                path: query.path,
            },

        };
        socket.emit("super.task-run", params);
    },

    recipeRecordCsv: function (query, callback) {
        var _device = navigator.platform.indexOf("Win") > -1 ? "pc" : query.position;
        hailib.define(["pn"], function (pn) {
            if (pn.series === "IPC") _device = "pc";
        });
        var curUserAgent = navigator.userAgent;
        if (curUserAgent.indexOf("rk322x-box") > -1 || curUserAgent.indexOf("TVBox") > -1) {
            _device = "pc";
        } else {
            _device = "pc";
        }

        var params = {
            taskName: arguments.callee.name,
            options: {
                device: _device,
                platform: navigator.platform,
                path: query.path,
                selectBomID: query.recipeId,
                selectBomTable: query.recipeTableId,
            },

        };
        socket.emit("super.task-run", params);
    },

    alarmRecordCsv: function (query, callback) {
        var _device = navigator.platform.indexOf("Win") > -1 ? "pc" : query.position;
        hailib.define(["pn"], function (pn) {
            if (pn.series === "IPC") _device = "pc";
        });

        var curUserAgent = navigator.userAgent;
        if (curUserAgent.indexOf("rk322x-box") > -1 || curUserAgent.indexOf("TVBox") > -1) {
            _device = "pc";
        } else {
            _device = "pc";
        }
        var params = {
            taskName: arguments.callee.name,
            options: {
                device: _device,
                group: query.id,
                path: query.path,
            },

        };
        socket.emit("super.task-run", params);
    },

    PrintText: function (name, text) { },

    PrintLine: function (name, arr) { },

    getConnected: function () { },

    publish: function (topic, message, opts, callback) { },

    graphicAudioPlay: function (element, stage) {
        hailib.define(["audio"], function (audioModule) {
            audioModule.playAudio(element, stage);
        });
    }
}