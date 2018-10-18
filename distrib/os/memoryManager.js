///<reference path="../globals.ts" />
/* ------------
memoryAccessor.ts
Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.loadMemory = function (inputOpCodes) {
            var baseReg;
            if (_Memory.memoryP1) { //assigns three partitions with a set amount of space
                baseReg = 999;
            }
            else {
                _Memory.memoryP1 = true;
                baseReg = 0;
            }
            for (var i = baseReg; i < inputOpCodes.length; i++) {
                _Memory.memory[i] = inputOpCodes[i]; //program is put in the memory partition
            }
            TSOS.Control.updateMemoryTable(baseReg); //updates table
            return baseReg;
        };
        MemoryManager.prototype.readMemory = function (index) {
            var opCode = _Memory.memory[index];
            return opCode;
        };
        MemoryManager.prototype.updateMemory = function (addr, data) {
            var index = parseInt(addr, 16);
            _Memory.memory[index] = data.toString(16);
            TSOS.Control.updateMemoryTable(0);
        };
        MemoryManager.prototype.clearPartition = function (baseReg) {
            for (var i = baseReg; i <= baseReg + 255; i++) {
                _Memory.memory[i] = "00";
            }
            if (baseReg == 0) {
                _Memory.memoryP1 = false;
            }
            TSOS.Control.updateMemoryTable(baseReg);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
