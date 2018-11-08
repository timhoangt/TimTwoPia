///<reference path="../globals.ts" />
 /* ------------
     cpuScheduler.ts
      Requires global.ts.
     ------------ */
module TSOS {
	export class CpuScheduler {
		public algorithm = "Round Robin";
        public quantum = 6;
        public currCycle = 0;
        public activePIDList = new Array<number>();
        public totalCycles = 0;
        public runningProcess;

        public start(): void {
            this.currCycle = 0;
            this.totalCycles = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            this.runningProcess.pState = "Running";
            _CPU.isExecuting = true;
            Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
        }

        public checkSchedule(): void {
            if (this.activePIDList.length == 0){
                    _CPU.init();
            }
            else {
                this.currCycle++;
                this.runningProcess.turnaroundTime++;
                this.totalCycles++;
                if (this.currCycle >= this.quantum){
                    if (!_ReadyQueue.isEmpty()){
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    }
                }
            }
        }
	}
} 