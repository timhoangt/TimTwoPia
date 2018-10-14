module TSOS {
    export class Process { //pcb 
        public pid: number; //gets pID
        public pCounter: number = 0; //points to instructions
        public pAcc: number = 0;
        public pXreg: number = 0;
        public pYreg: number = 0;
        public pZflag: number = 0; 
        public pPriority: number = 0;
        public pState: string = "Not running";
        public pLocation: string = "Memory";
        public pBase: number;
        public pLimit: number;

        constructor(pid, pBase) { //assigns values to process
         	this.pid = pid;
            this.pBase = pBase;
            this.pLimit = pBase + 255;
        }

        public getPid() {
            return this.pid;
        }
    }
} 