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
            _Memory.updateTable(baseReg); //updates table
            return baseReg;
        };
        MemoryManager.prototype.readMemory = function (pBase, pLimit) {
            var opCode = [];
            for (var i = pBase; i <= pLimit; i++) {
                opCode.push(_Memory.memory[i]);
            }
            return opCode;
        };
        MemoryManager.prototype.updateMemory = function (addr, data) {
            var index = parseInt(addr, 16);
            _Memory.memory[index] = data.toString(16);
            _Memory.updateTable(0);
        };
        MemoryManager.prototype.clearPartition = function (pBase) {
            for (var i = pBase; i <= pBase + 255; i++) {
                _Memory.memory[i] = "00";
            }
            _Memory.memoryP1 = false;
            _Memory.updateTable(pBase);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
