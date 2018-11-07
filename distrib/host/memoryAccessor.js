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
            var baseReg = _RunningpBase;
            var limitReg = baseReg + 255;
            var index = parseInt(addr, 16) + baseReg;
            if (index > limitReg) {
            }
            else {
                _Memory.memory[index] = data.toString(16);
                // 0 for now bc only one parition
                TSOS.Control.updateMemoryTable(0);
            }
        };
        MemoryAccessor.prototype.readMemory = function (addr) {
            var baseReg = _RunningpBase;
            var value = _Memory.memory[baseReg + addr];
            return value;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
