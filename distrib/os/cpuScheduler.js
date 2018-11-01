///<reference path="../globals.ts" />
/* ------------
    cpuScheduler.ts
     Requires global.ts.
    ------------ */
var TSOS;
(function (TSOS) {
    var CpuScheduler = /** @class */ (function () {
        function CpuScheduler() {
            this.algorithm = "Round Robin";
            this.quantum = 6;
            this.currCycle = 0;
        }
        CpuScheduler.prototype.start = function () {
            this.currCycle = 0;
            var process = _ReadyQueue.dequeue();
            process.pState = "Running";
            TSOS.Control.updateProcessTable(process.pid, process.pState);
            _RunningPID = process.pid;
            _RunningpBase = process.pBase;
        };
        CpuScheduler.prototype.checkSchedule = function () {
            this.currCycle++;
            if (this.currCycle > this.quantum) {
                if (!_ReadyQueue.isEmpty()) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, _RunningPID));
                }
                else {
                    if (_CPU.IR == "00") {
                        _CPU.init();
                    }
                }
                this.currCycle = 0;
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
