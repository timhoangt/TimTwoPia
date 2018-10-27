///<reference path="../globals.ts" />
/* ------------
    MEMORYACCESSOR.ts
    Requires global.ts.
    ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.init = function () {
        };
        MemoryAccessor.prototype.writeMemory = function (addr, data) {
            var process = _ReadyQueue.dequeue();
            _ReadyQueue.enqueue(process);
            var baseReg = process.pBase;
            var index = parseInt(addr, 16) + baseReg;
            _Memory.memory[index] = data.toString(16);
            TSOS.Control.updateMemoryTable(0);
        };
        MemoryAccessor.prototype.readMemory = function (addr) {
            var baseReg = _ReadyQueue.q[0].pBase;
            var value = _Memory.memory[baseReg + addr];
            return value;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
