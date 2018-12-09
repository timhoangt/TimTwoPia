///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
  DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The File System Device Driver.
  ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = /** @class */ (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            var _this = _super.call(this) || this;
            _this.driverEntry = _this.krnFSDriverEntry;
            return _this;
        }
        DeviceDriverFileSystem.prototype.krnFSDriverEntry = function () {
            this.status = "loaded";
            if (sessionStorage) {
                if (sessionStorage.length == 0) {
                    var tsb;
                    var value = new Array();
                    for (var i = 0; i < 4; i++) {
                        value.push("0");
                    }
                    while (value.length < 64) {
                        value.push("00");
                    }
                    for (var i = 0; i < 8; i++) {
                        for (var j = 0; j < 78; j++) {
                            tsb = j.toString();
                            if (tsb.length < 2) {
                                tsb = "0" + tsb;
                            }
                            tsb = i.toString() + tsb;
                            sessionStorage.setItem(tsb, JSON.stringify(value));
                        }
                    }
                    var sessionLength = sessionStorage.length;
                }
            }
            else {
                alert("Sorry, your browser do not support session storage.");
            }
        };
        DeviceDriverFileSystem.prototype.formatDisk = function () {
            var tsb;
            var value = new Array();
            var sessionLength = sessionStorage.length;
            for (var i = 0; i < sessionLength; i++) {
                var tsb = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "0";
                sessionStorage.setItem(tsb, JSON.stringify(value));
            }
        };
        DeviceDriverFileSystem.prototype.zeroFill = function (tsb) {
            var value = value = JSON.parse(sessionStorage.getItem(tsb));
            for (var i = 0; i < 4; i++) {
                value[i] = "0";
            }
            for (var j = 4; j < value.length; j++) {
                value[j] = "00";
            }
            sessionStorage.setItem(tsb, JSON.stringify(value));
            TSOS.Control.updateDiskTable(tsb);
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            var createdFile = false;
            var dirTSB;
            var value = new Array();
            var asciiFilename;
            var existFilename = this.lookupDataTSB(filename);
            if (existFilename) {
                return "ERROR! A file with that name already exists!";
            }
            else {
                for (var i = 1; i < 78; i++) {
                    var dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    if (value[0] == "0") {
                        this.zeroFill(dirTSB);
                        value = JSON.parse(sessionStorage.getItem(dirTSB));
                        var dataTSB = this.findDataTSB();
                        if (dataTSB != null) {
                            value[0] = "1";
                            for (var k = 1; k < 4; k++) {
                                value[k] = dataTSB.charAt(k - 1);
                            }
                            asciiFilename = filename.toString();
                            for (var j = 0; j < asciiFilename.length; j++) {
                                value[j + 4] = asciiFilename.charCodeAt(j).toString(16).toUpperCase();
                            }
                            sessionStorage.setItem(dirTSB, JSON.stringify(value));
                            TSOS.Control.updateDiskTable(dirTSB);
                            return filename + " - File created";
                        }
                        else {
                            return "ERROR! Disk is full!";
                        }
                    }
                }
            }
            return "ERROR! Directory is full!";
        };
        DeviceDriverFileSystem.prototype.findDataTSB = function () {
            var dataTSB;
            var value = new Array();
            for (var i = 78; i < sessionStorage.length; i++) {
                dataTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                if (value[0] == "0") {
                    this.zeroFill(dataTSB);
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    value[0] = "1";
                    sessionStorage.setItem(dataTSB, JSON.stringify(value));
                    return dataTSB;
                }
            }
            return dataTSB;
        };
        DeviceDriverFileSystem.prototype.lookupDataTSB = function (filename) {
            var dirTSB;
            var dataTSB;
            var value = new Array();
            var dirFilename = "";
            for (var i = 1; i < 78; i++) {
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "1") {
                    var index = 4;
                    var letter;
                    while (value[index] != "00") {
                        letter = String.fromCharCode(parseInt(value[index], 16));
                        dirFilename = dirFilename + letter;
                        index++;
                    }
                    if (dirFilename == filename) {
                        dataTSB = value.splice(1, 3).toString().replace(/,/g, "");
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        return dataTSB;
                    }
                    dirFilename = "";
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.writeFile = function (filename, fileContent) {
            var tsbUsed = new Array();
            var dataTSB = this.lookupDataTSB(filename);
            var firstTSB = dataTSB;
            var value = new Array();
            var charCode;
            if (dataTSB != null) {
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                var contentIndex = 0;
                var valueIndex;
                var firstIndex;
                var pointer = value[1] + value[2] + value[3];
                if (pointer == "000") {
                    valueIndex = 4;
                }
                else {
                    while (pointer != "-1-1-1") {
                        dataTSB = pointer;
                        tsbUsed.push(dataTSB);
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        pointer = value[1] + value[2] + value[3];
                    }
                    for (var i = 4; i < value.length; i++) {
                        if (value[i] == "00") {
                            valueIndex = i;
                            break;
                        }
                    }
                }
                firstIndex = valueIndex;
                while (contentIndex < fileContent.length) {
                    if (valueIndex == 64) {
                        var oldDataTSB = dataTSB;
                        dataTSB = this.findDataTSB();
                        tsbUsed.push(dataTSB);
                        if (dataTSB != null) {
                            for (var k = 1; k < 4; k++) {
                                value[k] = dataTSB.charAt(k - 1);
                            }
                            sessionStorage.setItem(oldDataTSB, JSON.stringify(value));
                            TSOS.Control.updateDiskTable(oldDataTSB);
                            value = JSON.parse(sessionStorage.getItem(dataTSB));
                            valueIndex = 4;
                        }
                        else {
                            for (var dataTSB in tsbUsed) {
                                this.zeroFill(dataTSB);
                            }
                            for (var m = firstIndex; m < 64; m++) {
                                value = JSON.parse(sessionStorage.getItem(firstTSB));
                                value[m] = "00";
                                sessionStorage.setItem(firstTSB, JSON.stringify(value));
                                TSOS.Control.updateDiskTable(firstTSB);
                            }
                            return "ERROR! Disk is full!";
                        }
                    }
                    else {
                        charCode = fileContent.charCodeAt(contentIndex);
                        value[valueIndex] = charCode.toString(16).toUpperCase();
                        contentIndex++;
                        valueIndex++;
                    }
                }
                for (var k = 1; k < 4; k++) {
                    value[k] = "-1";
                }
                sessionStorage.setItem(dataTSB, JSON.stringify(value));
                TSOS.Control.updateDiskTable(dataTSB);
                return filename + " - File written";
            }
            else {
                return "ERROR! File does not exist!";
            }
        };
        DeviceDriverFileSystem.prototype.readFile = function (filename) {
            var fileContent = filename + ": ";
            var dataTSB = this.lookupDataTSB(filename);
            var value = new Array();
            var pointer;
            var index;
            var charCode;
            if (dataTSB != null) {
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                pointer = value[1] + value[2] + value[3];
                index = 4;
                while (index < 64 && value[index] != "00") {
                    charCode = parseInt(value[index], 16);
                    fileContent = fileContent + String.fromCharCode(charCode);
                    index++;
                    if (index == 64 && pointer != "-1-1-1") {
                        value = JSON.parse(sessionStorage.getItem(pointer));
                        pointer = value[1] + value[2] + value[3];
                        index = 4;
                    }
                }
                return fileContent;
            }
            else {
                return "ERROR! File does not exist!";
            }
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (filename) {
            var dataTSB = this.lookupDataTSB(filename);
            var dirTSB;
            var value = new Array();
            var pointer;
            if (dataTSB != null) {
                for (var i = 0; i < 78; i++) {
                    dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    pointer = value[1] + value[2] + value[3];
                    if (pointer == dataTSB) {
                        value[0] = "0";
                        sessionStorage.setItem(dirTSB, JSON.stringify(value));
                        break;
                    }
                }
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                value[0] = "0";
                sessionStorage.setItem(dataTSB, JSON.stringify(value));
                TSOS.Control.updateDiskTable(dataTSB);
                pointer = value[1] + value[2] + value[3];
                if (pointer != "000") {
                    while (pointer != "-1-1-1") {
                        dataTSB = pointer;
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        value[0] = "0";
                        sessionStorage.setItem(dataTSB, JSON.stringify(value));
                        TSOS.Control.updateDiskTable(dataTSB);
                        pointer = value[1] + value[2] + value[3];
                    }
                }
                return "File was deleted.";
            }
            else {
                return "ERROR! File does not exist!";
            }
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
