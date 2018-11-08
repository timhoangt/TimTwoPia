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
            TSOS.Control.loadMemoryTable();
        };
        MemoryAccessor.prototype.writeMemory = function (addr, data) {
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index = parseInt(addr, 16) + baseReg;
            if (index > limitReg) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else {
                _Memory.memory[index] = data.toString(16);
                // 0 for now bc only one parition
                TSOS.Control.updateMemoryTable(baseReg);
            }
        };
        MemoryAccessor.prototype.readMemory = function (addr) {
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index = baseReg + addr;
            if (index > limitReg) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else {
                var value = _Memory.memory[index];
                return value;
            }
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
