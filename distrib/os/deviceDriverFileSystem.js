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
            _this.track = 8;
            _this.sector = 8;
            _this.block = 8;
            _this.blockSize = 64;
            _this.dirTableSize = _this.sector * _this.block;
            _this.dataTableSize = (_this.track - 1) * _this.sector * _this.block;
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
                    while (value.length < this.blockSize) {
                        value.push("00");
                    }
                    for (var i = 0; i < this.track; i++) {
                        for (var j = 0; j < this.sector; j++) {
                            for (var k = 0; k < this.block; k++) {
                                tsb = i.toString() + j.toString() + k.toString();
                                sessionStorage.setItem(tsb, JSON.stringify(value));
                            }
                        }
                    }
                }
            }
            else {
                alert("Sorry, your browser do not support session storage.");
            }
        };
        DeviceDriverFileSystem.prototype.formatDisk = function () {
            var tsb;
            var value = new Array();
            for (var i = 0; i < sessionStorage.length; i++) {
                var tsb = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "0";
                this.updateTSB(tsb, value);
            }
            return "Disk has been formatted.";
        };
        DeviceDriverFileSystem.prototype.zeroFill = function (tsb) {
            var value = value = JSON.parse(sessionStorage.getItem(tsb));
            for (var i = 0; i < 4; i++) {
                value[i] = "0";
            }
            for (var j = 4; j < value.length; j++) {
                value[j] = "00";
            }
            this.updateTSB(tsb, value);
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            var createdFile = false;
            var dirTSB;
            var value = new Array();
            var asciiFilename;
            var existFilename = this.lookupDataTSB(filename);
            if (existFilename != null) {
                return "ERROR! A file with that name already exists!";
            }
            else {
                for (var i = 1; i < this.dirTableSize; i++) {
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
                            this.updateTSB(dirTSB, value);
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
                    this.updateTSB(dataTSB, value);
                    return dataTSB;
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.lookupDataTSB = function (filename) {
            var dirTSB;
            var dataTSB;
            var value = new Array();
            var dirFilename;
            for (var i = 1; i < this.dirTableSize; i++) {
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "1") {
                    dirFilename = this.getFilename(value);
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
                var valueIndex = 0;
                var firstIndex;
                var pointer = this.getPointer(value);
                if (pointer == "000") {
                    valueIndex = 4;
                }
                else {
                    while (pointer != "-1-1-1") {
                        dataTSB = pointer;
                        tsbUsed.push(dataTSB);
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        pointer = this.getPointer(value);
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
                    if (valueIndex == this.blockSize) {
                        var oldDataTSB = dataTSB;
                        dataTSB = this.findDataTSB();
                        tsbUsed.push(dataTSB);
                        if (dataTSB != null) {
                            for (var k = 1; k < 4; k++) {
                                value[k] = dataTSB.charAt(k - 1);
                            }
                            this.updateTSB(oldDataTSB, value);
                            value = JSON.parse(sessionStorage.getItem(dataTSB));
                            valueIndex = 4;
                        }
                        else {
                            for (var dataTSB in tsbUsed) {
                                this.zeroFill(dataTSB);
                            }
                            for (var m = firstIndex; m < this.blockSize; m++) {
                                value = JSON.parse(sessionStorage.getItem(firstTSB));
                                value[m] = "00";
                                this.updateTSB(firstTSB, value);
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
                this.updateTSB(firstTSB, value);
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
                pointer = this.getPointer(value);
                index = 4;
                while (index < this.blockSize && value[index] != "00") {
                    charCode = parseInt(value[index], 16);
                    fileContent = fileContent + String.fromCharCode(charCode);
                    index++;
                    if (index == this.blockSize && pointer != "-1-1-1") {
                        value = JSON.parse(sessionStorage.getItem(pointer));
                        pointer = this.getPointer(value);
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
                for (var i = 0; i < this.dirTableSize; i++) {
                    dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    pointer = this.getPointer(value);
                    if (pointer == dataTSB) {
                        value[0] = "0";
                        this.updateTSB(dirTSB, value);
                        break;
                    }
                }
                pointer = this.deleteHelper(dataTSB);
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
        DeviceDriverFileSystem.prototype.updateTSB = function (tsb, value) {
            sessionStorage.setItem(tsb, JSON.stringify(value));
            TSOS.Control.updateDiskTable(tsb);
        };
        DeviceDriverFileSystem.prototype.getPointer = function (value) {
            var pointer = value[1] + value[2] + value[3];
            return pointer;
        };
        DeviceDriverFileSystem.prototype.getFilename = function (value) {
            var index = 4;
            var letter;
            var dirFilename = "";
            while (value[index] != "00" && index < this.blockSize) {
                letter = String.fromCharCode(parseInt(value[index], 16));
                dirFilename = dirFilename + letter;
                index++;
            }
            return dirFilename;
        };
        DeviceDriverFileSystem.prototype.deleteHelper = function (tsb) {
            var value = JSON.parse(sessionStorage.getItem(tsb));
            value[0] = "0";
            this.updateTSB(tsb, value);
            var pointer = this.getPointer(value);
            return pointer;
        };
        DeviceDriverFileSystem.prototype.listFiles = function () {
            var dirTSB;
            var value = new Array();
            var dirFilename;
            var files = new Array();
            for (var i = 1; i < this.dirTableSize; i++) {
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if (value[0] == "1") {
                    dirFilename = this.getFilename(value);
                    files.push(dirFilename);
                    dirFilename = "";
                }
            }
            return (files);
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
