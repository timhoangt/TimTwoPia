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
            if(this.schedule == "Non-preemptive Priority" && _ReadyQueue.getSize()>1){ //if priority
                this.sortPriority(); //run sortpriority
            }
            this.currCycle = 0;
            this.totalCycles = 0;
            this.runningProcess = _ReadyQueue.dequeue();
            if (this.runningProcess.pBase == 999){ //if 1st process in queue is in memory
                var target = _ReadyQueue.dequeue(); //swap with process in memory
                while(target.pBase == 999){
                    _ReadyQueue.enqueue(target);
                    target = _ReadyQueue.dequeue;
                }
                var tsb = _Swapper.swapProcess(this.runningProcess.tsb, target.pBase, target.pLimit);
                if (tsb){ //if swapped
                    this.runningProcess.pBase = target.pBase; //back inside process queue inside disk
                    this.runningProcess.pLimit = target.pLimit;
                    target.tsb = tsb;
                    target.pBase = 999;
                    _ReadyQueue.enqueue(target);
                }
                else{ //no more room on disk
                var error = "Not enough room on disk."
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
            switch(newSchedule){ //changes scheduling according to what was written after the command
                case "rr":
                    this.schedule = "Round Robin";
                    this.quantum = 6; //quantum shorter for RR b/c shorter switchesa
                    returnMsg = "CPU scheduling algorithm is " + this.schedule;
                    break;
                case "fcfs":
                    this.schedule = "First-come, First-serve";
                    this.quantum = 1000;
                    returnMsg = "CPU scheduling algorithm is " + this.schedule;
                    break;
                case "priority":
                    this.schedule = "Non-preemptive Priority";
                    this.quantum = 1000;
                    returnMsg = "CPU scheduling algorithm is " + this.schedule;
                default:
                    returnMsg = "CPU scheduling algorithm has not changed." + this.schedule;
            }
            Control.updateScheduling(this.schedule);
            return returnMsg;
        }

        public sortPriority(){
            var firstProcess = _ReadyQueue.dequeue();
            var secondProcess;
            var comparison = 0;
            while(comparison<_ReadyQueue.getSize()){ //compare priorities of processes
                secondProcess = _ReadyQueue.dequeue();
                if(secondProcess.pPriority < firstProcess.pPriority){ //queue from lowest to highest number
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