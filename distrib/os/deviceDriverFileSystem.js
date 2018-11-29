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
                var tsb;
                var value = new Array();
                while (value.length < 65) {
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
            else {
                alert("Session Storage not allowed.");
            }
        };
        DeviceDriverFileSystem.prototype.formatDisk = function () {
            var tsb;
            var value = new Array();
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 78; j++) {
                    tsb = j.toString();
                    if (tsb.length < 2) {
                        tsb = "0" + tsb;
                    }
                    tsb = i.toString() + tsb;
                    value = JSON.parse(sessionStorage.getItem(tsb));
                    value[0] = "00";
                    sessionStorage.setItem(tsb, JSON.stringify(value));
                }
            }
            var sessionLength = sessionStorage.length;
        };
        DeviceDriverFileSystem.prototype.createFile = function () {
            return;
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
