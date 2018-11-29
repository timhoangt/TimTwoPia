///<reference path="../globals.ts" />
 /* ------------
     cpuScheduler.ts
      Requires global.ts.
     ------------ */
module TSOS {
	export class CpuScheduler {
		public schedule = "Round Robin";
        public quantum = 6; //the quantum value
        public currCycle = 0;
        public activePIDList = new Array<number>();
        public totalCycles = 0; //how many cycles the program has been running
        public runningProcess;

        public start(): void { //starting the first program in a batch
            this.currCycle = 0;
            this.totalCycles = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            this.runningProcess.pState = "Running";
            _CPU.isExecuting = true;
            Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState);
        }

        public checkSchedule(): void {
            if (this.activePIDList.length == 0){ //if there are multiple programs running at once
                    _CPU.init();
            }
            else {
                this.currCycle++; //add a cycle
                this.runningProcess.turnaroundTime++;
                this.totalCycles++;
                if (this.currCycle >= this.quantum){ //when the quantum has been reached
                    if (!_ReadyQueue.isEmpty()){ //if there are more processes do a context switch
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, this.runningProcess));
                    }
                }
            }
        }

        public setSchedule(schedule): void{
            switch (schedule){
                case "rr":
                    this.schedule = "Round Robin";
                    this.quantum = 6;
                    break;
                case "fcfs":
                    this.schedule = "First-come, First-serve"
                    this.quantum = 30;
                    break;
                case "priority":
                    this.schedule = "Non-preemptive Priority";
                    this.quantum = 30;
                default:
                    this.quantum = 6;
                    break;
            }
        }
	}
} 