///<reference path="../globals.ts" />
/* ------------
MEMORY.ts
 Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            //see if partition has content
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
        //initializes memory
        Memory.prototype.init = function () {
            this.memory = new Array();
            for (var i = 0; i < 768; i++) {
                this.memory.push("00");
            }
            //shows which partitions exist
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
            TSOS.Control.loadMemoryTable();
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
