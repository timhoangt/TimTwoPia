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

        public start(): void {
            this.currCycle = 0;
            var process = _ReadyQueue.dequeue();
            process.pState = "Running";
            Control.updateProcessTable(process.pid, process.pState);
            _RunningPID = process.pid;
            _RunningpBase = process.pBase;
        }

        public checkSchedule(): void {
            this.currCycle++;
            if (this.currCycle > this.quantum){
                if (!_ReadyQueue.isEmpty()){
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, _RunningPID));
                }
                else {
	                if(_CPU.IR == "00"){
	                    _CPU.init();
	                }
	            }
                this.currCycle = 0;
            }
        }
	}
} 