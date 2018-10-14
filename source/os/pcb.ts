module TSOS {
    export class PCB { //pcb
        public pid: number = -1; //gets pID
        public pCounter: number = 0; //points to instructions
        public pAcc: number = 0;
        public pXreg: number = 0;
        public pYreg: number = 0;
        public pZflag: number = 0; 
        public pPriority: number = 0;
        public pState: string = "New";
        public pLocation: string = "Memory";
        public pBase: number;
        public pLimit: number = 256;

        constructor(pBase) { //assigns values to process
            this.pBase = pBase;
            this.pid++;
            this.pState = "Resident";
        }

        public getPid() {
            return this.pid;
        }
        public getPBase() {
            return this.pBase;
        }
         public getPLimit() {
            return this.pLimit;
        }
    }
} 