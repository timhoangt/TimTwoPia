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
            _this.directoryTableSize = _this.sector * _this.block;
            _this.dataTableSize = (_this.track - 1) * _this.sector * _this.block;
            return _this;
        }
        DeviceDriverFileSystem.prototype.krnFSDriverEntry = function () {
            this.status = "loaded";
            if (sessionStorage) { //when a new session is booted
                if (sessionStorage.length == 0) {
                    var tsb;
                    var value = new Array(); //array for file system
                    for (var i = 0; i < 4; i++) {
                        value.push("0"); //pointer
                    }
                    while (value.length < this.blockSize) { //when smaller than block size
                        value.push("00"); //fill it in with 0s
                    }
                    for (var i = 0; i < this.track; i++) { //tracks
                        for (var j = 0; j < this.sector; j++) { //block subsections
                            for (var k = 0; k < this.block; k++) { //block itself
                                tsb = i.toString() + j.toString() + k.toString();
                                sessionStorage.setItem(tsb, JSON.stringify(value));
                            }
                        }
                    }
                    TSOS.Control.loadDiskTable();
                }
            }
            else {
                alert("Sorry, session storage is not available.");
            }
        };
        DeviceDriverFileSystem.prototype.formatDisk = function () {
            var tsb;
            var value = new Array();
            for (var i = 0; i < sessionStorage.length; i++) { //for storage size
                var tsb = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "0"; //reset the address registers to 0
                this.updateTSB(tsb, value); //clears values
            }
            return "Disk has been formatted.";
        };
        DeviceDriverFileSystem.prototype.formatFull = function () {
            var tsb;
            var value = new Array();
            for (var i = 0; i < sessionStorage.length; i++) { //for storage size
                var tsb = sessionStorage.key(i);
                this.zeroFill(tsb); //run zero fill (resets everything)
            }
            return "Disk has been full formatted.";
        };
        DeviceDriverFileSystem.prototype.zeroFill = function (tsb) {
            var value = value = JSON.parse(sessionStorage.getItem(tsb));
            for (var i = 0; i < 4; i++) {
                value[i] = "0"; //reset address registers
            }
            for (var j = 4; j < value.length; j++) {
                value[j] = "00"; //reset data inside
            }
            this.updateTSB(tsb, value); //clears values
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            var createdFile = false; //have to check prereqs first
            var directoryTSB;
            var value = new Array();
            var newFileName = new Array(); //create file name
            var existFilename = this.lookupDataTSB(filename); //check if anotehr file has same name
            if (existFilename != null) { //error if same name
                return "ERROR! A file with that name already exists!";
            }
            else {
                for (var i = 1; i < this.directoryTableSize; i++) { //for directoryectory size
                    var directoryTSB = sessionStorage.key(i); //give address register
                    value = JSON.parse(sessionStorage.getItem(directoryTSB));
                    if (value[0] == "0") {
                        this.zeroFill(directoryTSB);
                        value = JSON.parse(sessionStorage.getItem(directoryTSB));
                        var dataTSB = this.getTSB();
                        if (dataTSB != null) {
                            value[0] = "1";
                            for (var k = 1; k < 4; k++) {
                                value[k] = dataTSB.charAt(k - 1);
                            }
                            newFileName = this.convertHex(filename.toString());
                            var index = 4;
                            while (newFileName.length > 0) {
                                value[index] = newFileName.pop();
                                index++;
                            }
                            this.updateTSB(directoryTSB, value);
                            if (value[4] == "2E") { //if it starts with a .
                                return filename + " Created a hidden file.";
                            }
                            else { //if normal name
                                return filename + " Created a file.";
                            }
                        }
                        else {
                            return "ERROR! Disk is full!";
                        }
                    }
                }
            }
            return "ERROR! directoryectory is full!";
        };
        DeviceDriverFileSystem.prototype.getTSB = function () {
            var dataTSB;
            var value = new Array();
            for (var i = 78; i < sessionStorage.length; i++) {
                dataTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dataTSB)); //checks if 0 or 1
                if (value[0] == "0") {
                    this.zeroFill(dataTSB); //resets
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    value[0] = "1";
                    this.updateTSB(dataTSB, value); //changes to 1
                    return dataTSB;
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.lookupDataTSB = function (filename) {
            var directoryTSB;
            var dataTSB;
            var value = new Array();
            var directoryFilename;
            for (var i = 1; i < this.directoryTableSize; i++) { //for directoryectory size
                directoryTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(directoryTSB));
                if (value[0] == "1") { //if address register is 1
                    directoryFilename = this.getFilename(value); //get the file
                    if (directoryFilename == filename) { //if names match
                        dataTSB = value.splice(1, 3).toString().replace(/,/g, "");
                        value = JSON.parse(sessionStorage.getItem(dataTSB)); //get new
                        return dataTSB;
                    }
                    directoryFilename = "";
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.writeFile = function (filename, fileContent) {
            var dataTSB = this.lookupDataTSB(filename); //get the address register
            var content = new Array();
            if (dataTSB != null) {
                content = this.convertHex(fileContent); //fill in the data
                var fileCreated = this.editFileSystem(dataTSB, content);
                if (fileCreated) {
                    return filename + " - File written";
                }
                else {
                    return "ERROR! Disk is full!";
                }
            }
            else {
                return "ERROR! File does not exist!";
            }
        };
        DeviceDriverFileSystem.prototype.editFileSystem = function (dataTSB, content) {
            var tsbUsed = new Array();
            var firstTSB = dataTSB; //address registers
            var value = new Array(); //array of values
            var valueIndex = 0;
            var firstIndex;
            value = JSON.parse(sessionStorage.getItem(dataTSB));
            var pointer = this.getPointer(value);
            if (pointer == "000") { //if pointer is empty
                valueIndex = 4;
            }
            else {
                while (pointer != "-1-1-1") { //if pointer is active
                    dataTSB = pointer;
                    tsbUsed.push(dataTSB); //get address register
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    pointer = this.getPointer(value);
                }
                for (var i = 4; i < value.length; i++) { //end of data
                    if (value[i] == "00") {
                        valueIndex = i;
                        break;
                    }
                }
            }
            firstIndex = valueIndex;
            while (content.length > 0) {
                if (valueIndex == this.blockSize) {
                    var oldDataTSB = dataTSB;
                    dataTSB = this.getTSB();
                    tsbUsed.push(dataTSB);
                    if (dataTSB != null) {
                        for (var k = 1; k < 4; k++) {
                            value[k] = dataTSB.charAt(k - 1);
                        }
                        this.updateTSB(oldDataTSB, value); //gets new address register
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        valueIndex = 4;
                    }
                    else {
                        for (var tsb in tsbUsed) { //resets address register
                            this.zeroFill(tsb);
                        }
                        for (var m = firstIndex; m < this.blockSize; m++) {
                            value = JSON.parse(sessionStorage.getItem(firstTSB));
                            value[m] = "00"; //resets value
                            this.updateTSB(firstTSB, value);
                        }
                        return false;
                    }
                }
                else {
                    value[valueIndex] = content.pop();
                    valueIndex++;
                }
            }
            for (var k = 1; k < 4; k++) {
                value[k] = "-1";
            }
            this.updateTSB(dataTSB, value);
            return true;
        };
        DeviceDriverFileSystem.prototype.readFile = function (filename) {
            var fileContent = filename + ": ";
            var dataTSB = this.lookupDataTSB(filename); //look up address
            var value = new Array();
            var pointer;
            var index;
            var charCode;
            if (dataTSB != null) { //if address register is active
                value = JSON.parse(sessionStorage.getItem(dataTSB)); //get data
                pointer = this.getPointer(value);
                index = 4;
                while (index < this.blockSize && value[index] != "00") { //dont retrive if empty
                    charCode = parseInt(value[index], 16);
                    fileContent = fileContent + String.fromCharCode(charCode); //send data
                    index++;
                    if (index == this.blockSize && pointer != "-1-1-1") { //if pointer is active
                        value = JSON.parse(sessionStorage.getItem(pointer));
                        pointer = this.getPointer(value); //get pointer
                        index = 4;
                    }
                }
                return fileContent; //send data in file
            }
            else {
                return "ERROR! File does not exist!";
            }
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (filename) {
            var dataTSB = this.lookupDataTSB(filename); //look up address register
            var directoryTSB;
            var value = new Array();
            var pointer;
            if (dataTSB != null) {
                for (var i = 0; i < this.directoryTableSize; i++) {
                    directoryTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(directoryTSB));
                    pointer = this.getPointer(value);
                    if (pointer == dataTSB) {
                        value[0] = "0"; //if pointer isnt active
                        this.updateTSB(directoryTSB, value);
                        break;
                    }
                }
                pointer = this.deleteHelper(dataTSB);
                if (pointer != "000") {
                    while (pointer != "-1-1-1") { //if pointer is active
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
            TSOS.Control.updateDiskTable(tsb); //send data to control.js
        };
        DeviceDriverFileSystem.prototype.getPointer = function (value) {
            var pointer = value[1] + value[2] + value[3]; //pointer is the three digit number
            return pointer;
        };
        DeviceDriverFileSystem.prototype.getFilename = function (value) {
            var index = 4;
            var letter;
            var directoryFilename = "";
            while (value[index] != "00" && index < this.blockSize) { //gets file name from block
                letter = String.fromCharCode(parseInt(value[index], 16));
                directoryFilename = directoryFilename + letter;
                index++;
            }
            return directoryFilename;
        };
        DeviceDriverFileSystem.prototype.deleteHelper = function (tsb) {
            var value = JSON.parse(sessionStorage.getItem(tsb)); //gets address register
            value[0] = "0";
            this.updateTSB(tsb, value);
            var pointer = this.getPointer(value);
            return pointer;
        };
        DeviceDriverFileSystem.prototype.listFiles = function () {
            var directoryTSB;
            var value = new Array(); //makes title from data
            var directoryFilename;
            var files = new Array(); //makes array of titles
            for (var i = 1; i < this.directoryTableSize; i++) { //for table size
                directoryTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(directoryTSB)); //get from address registers
                if (value[0] == "1" && value[4] != "2E") { //not hidden
                    directoryFilename = this.getFilename(value);
                    files.push(directoryFilename);
                    directoryFilename = "";
                }
            }
            return (files);
        };
        DeviceDriverFileSystem.prototype.listHiddenFiles = function () {
            var directoryTSB;
            var value = new Array(); //makes title from data
            var directoryFilename;
            var files = new Array(); //makes array of titles
            for (var i = 1; i < this.directoryTableSize; i++) { //for table size
                directoryTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(directoryTSB)); //get from address registers
                if (value[0] == "1") { //all files
                    directoryFilename = this.getFilename(value);
                    files.push(directoryFilename);
                    directoryFilename = "";
                }
            }
            return (files);
        };
        DeviceDriverFileSystem.prototype.convertHex = function (string) {
            var asciiHex = new Array(); //converts to ASCII
            var hexVal;
            for (var i = string.length - 1; i >= 0; i--) {
                hexVal = string.charCodeAt(i).toString(16);
                asciiHex.push(hexVal.toUpperCase());
            }
            return asciiHex;
        };
        DeviceDriverFileSystem.prototype.writeProcess = function (programInput) {
            var dataTSB = this.getTSB();
            var content = new Array();
            if (dataTSB != null) {
                while (programInput.length > 0) {
                    content.push(programInput.pop());
                }
                var processLoaded = this.editFileSystem(dataTSB, content); //when loaded, add into FS
                if (processLoaded) {
                    return dataTSB; //return the address register
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        DeviceDriverFileSystem.prototype.retrieveProcess = function (tsb) {
            var value = JSON.parse(sessionStorage.getItem(tsb));
            var programInput = new Array();
            var pointer = this.getPointer(value); //gets address register
            var index = 4;
            var opCode;
            while (pointer != "-1-1-1") { //if bigger than one block
                while (index < value.length) {
                    opCode = value[index];
                    programInput.push(opCode);
                    index++; //gets data
                }
                value[0] = "0"; //empties block
                this.updateTSB(tsb, value);
                value = JSON.parse(sessionStorage.getItem(pointer));
                pointer = this.getPointer(value);
                index = 4;
            }
            while (index < value.length) { //adds to previous block
                opCode = value[index];
                programInput.push(opCode);
                index++;
            }
            value[0] = "0"; //empties block again
            this.updateTSB(tsb, value);
            if (programInput.length > 256) { //splices it into smaller sections
                programInput.splice(256, (programInput.length - 256));
            }
            return programInput;
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
