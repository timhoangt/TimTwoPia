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
            //checks the register for the current program for the first address
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index = parseInt(addr, 16) + baseReg;
            if (index > limitReg) { //if there is not enough space get access error
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else { //update memory table
                _Memory.memory[index] = data.toString(16);
                TSOS.Control.updateMemoryTable(baseReg);
            }
        };
        MemoryAccessor.prototype.readMemory = function (addr) {
            //checks the register for the current program for the first address
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index = baseReg + addr;
            if (index > limitReg) { //if there is not enough space get access error
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else { //pulls the data in the memory
                var value = _Memory.memory[index];
                return value;
            }
        };
        //gets data from disk and turns it into string
        MemoryAccessor.prototype.retreiveMemory = function (baseReg, limitReg) {
            var value = _Memory.memory.slice(baseReg, (baseReg + limitReg + 1));
            return value;
        };
        //puts data into disk
        MemoryAccessor.prototype.appendMemory = function (baseReg, index, data) {
            _Memory.memory[index] = data.toString(16).toUpperCase();
            TSOS.Control.updateMemoryTable(baseReg);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
