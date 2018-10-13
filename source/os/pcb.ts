module TSOS {
    export class Process {
        public pid: number;
        public pCounter: number = 0;
        public pAcc: number = 0;
        public pXreg: number = 0;
        public pYreg: number = 0;
        public pZflag: number = 0; 
        public pPriority: number = 0;
        public pState: string = "Not running";
        public pLocation: string = "Memory";
        public pBase: number;
        public pLimit: number;

        constructor(pid, pBase) {
         	this.pid = pid;
            this.pBase = pBase;
            this.pLimit = pBase + 255;
        }
        
        public getPid() {
            return this.pid;
        }
    }
} 