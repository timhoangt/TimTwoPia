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
            this.quantum = 6; //the quantum value
            this.currCycle = 0;
            this.activePIDList = new Array();
            this.totalCycles = 0; //how many cycles the program has been running
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
            if (this.activePIDList.length == 0) { //if there are multiple programs running at once
                _CPU.init();
            }
            else {
                this.currCycle++; //add a cycle
                this.runningProcess.turnaroundTime++;
                this.totalCycles++;
                if (this.currCycle >= this.quantum) { //when the quantum has been reached
                    if (!_ReadyQueue.isEmpty()) { //if there are more processes do a context switch
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    }
                }
            }
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
