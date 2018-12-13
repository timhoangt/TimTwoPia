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
            if(this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize()>1){
                this.sortPriority();
            }
            this.currCycle = 0;
            this.totalCycles = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            if (this.runningProcess.pBase == 999){
                var victim = _ReadyQueue.dequeue();
                while(victim.pBase == 999){
                    _ReadyQueue.enqueue(victim);
                    victim = _ReadyQueue.dequeue;
                }
                var tsb = _Swapper.swapProcess(this.runningProcess.tsb, victim.pBase, victim.pLimit);
                if (tsb){
                    this.runningProcess.pBase = victim.pBase;
                    this.runningProcess.pLimit = victim.pLimit;
                    victim.tsb = tsb;
                    victim.pBase = 999;
                    _ReadyQueue.enqueue(victim);
                }
                else{
                var error = "Disk and memory are full."
                _KernelInterruptQueue.enqueue(new Interrupt(PROGRAMERROR_IRQ, error));
                _Kernel.krnExitProcess(_CpuScheduler.runningProcess);
                _CPU.init();
                }
            }
            this.runningProcess.pState = "Running";
            _CPU.isExecuting = true;
            Control.updateProcessTable(this.runningProcess.pid, this.runningProcess.pState, "Memory");
        }

        public checkSchedule(): void {
            if(this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize()>1){
                this.sortPriority();
            }
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

        public setSchedule(args): string{
            var returnMsg:string;
            var newSchedule:string = args.toString();
            switch(newSchedule){
                case "rr":
                    this.schedule = "Round Robin";
                    this.quantum = 6;
                    returnMsg = "CPU scheduling algorithm set to: " + this.schedule;
                    break;
                case "fcfs":
                    this.schedule = "First-come, First-serve";
                    this.quantum = 1000;
                    returnMsg = "CPU scheduling algorithm set to: " + this.schedule;
                    break;
                case "priority":
                    this.schedule = "Non-preemptive Priority";
                    this.quantum = 1000;
                    returnMsg = "CPU scheduling algorithm set to: " + this.schedule;
                default:
                    returnMsg = "CPU scheduling algorithm is: " + this.schedule;
            }
            Control.updateDisplaySchedule(this.schedule);
            return returnMsg;
        }

        public sortPriority(){
            var firstProcess = _ReadyQueue.dequeue();
            var secondProcess;
            var comparison = 0;
            while(comparison<_ReadyQueue.getSize()){
                secondProcess = _ReadyQueue.dequeue();
                if(secondProcess.pPriority < firstProcess.pPriority){
                    _ReadyQueue.enqueue(firstProcess);
                    firstProcess = secondProcess;
                }
                else{
                    _ReadyQueue.enqueue(secondProcess);
                }
                comparison++;
            }
            _ReadyQueue.enqueue(firstProcess);
            for(var i=0; i<_ReadyQueue.getSize()-1; i++){
                _ReadyQueue.enqueue(_ReadyQueue.dequeue());
            }
        }
	}
} 