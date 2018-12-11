///<reference path="../globals.ts" />
/* ------------
memoryManager.ts
Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            // sees if anything is in each partition
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
        MemoryManager.prototype.loadMemory = function (inputOpCodes) {
            var baseReg;
            //gives id of empty partition
            if (this.memoryP1) {
                //fills partition
                if (this.memoryP2) {
                    if (this.memoryP3) {
                        // memory is full
                        baseReg = 999;
                    }
                    else {
                        this.memoryP3 = true;
                        baseReg = 512;
                    }
                }
                else {
                    this.memoryP2 = true;
                    baseReg = 256;
                }
            }
            else {
                this.memoryP1 = true;
                baseReg = 0;
            }
            //puts program in the partition
            if (baseReg != 999) {
                for (var i = 0; i < inputOpCodes.length; i++) {
                    _Memory.memory[baseReg + i] = inputOpCodes[i];
                }
                TSOS.Control.updateMemoryTable(baseReg); //updates table
            }
            return baseReg;
        };
        //once executed, empties partition
        MemoryManager.prototype.clearPartition = function (baseReg) {
            for (var i = baseReg; i <= baseReg + 255; i++) {
                _Memory.memory[i] = "00";
            }
            if (baseReg == 0) {
                this.memoryP1 = false;
            }
            else if (baseReg == 256) {
                this.memoryP2 = false;
            }
            else {
                this.memoryP3 = false;
            }
            TSOS.Control.updateMemoryTable(baseReg);
        };
        MemoryManager.prototype.clearMemory = function () {
            // wipes memory clean
            this.clearPartition(0);
            this.memoryP1 = false;
            this.clearPartition(256);
            this.memoryP2 = false;
            this.clearPartition(512);
            this.memoryP3 = false;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
