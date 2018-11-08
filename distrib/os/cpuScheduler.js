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
            this.activePIDList = new Array();
            this.totalCycles = 0;
        }
        CpuScheduler.prototype.start = function () {
            this.currCycle = 0;
            this.totalCycles = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            this.runningProcess.pState = "Running";
            _CPU.isExecuting = true;
            TSOS.Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
        };
        CpuScheduler.prototype.checkSchedule = function () {
            if (this.activePIDList.length == 0) {
                _CPU.init();
            }
            else {
                this.currCycle++;
                this.runningProcess.turnaroundTime++;
                this.totalCycles++;
                if (this.currCycle >= this.quantum) {
                    if (!_ReadyQueue.isEmpty()) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    }
                }
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
