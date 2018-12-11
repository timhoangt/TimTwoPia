module TSOS {
    export class PCB { //pcb
        public pid: number; //gets pID
        public pCounter: number = 0; //points to instructions
        //public pIR: string = "00";
        public pAcc: number = 0;
        public pXreg: number = 0;
        public pYreg: number = 0;
        public pZflag: number = 0; 
        public pPriority: number = 0;
        public pState: string;
        public pLocation: string = "Memory";
        public pBase: number;
        public pLimit: number;
        public turnaroundTime: number = 0;
        public waitTime: number = 0;
        public tsb: string;

        constructor(pBase, pid, pState, pPriority, tsb) { //assigns values to process
            this.pBase = pBase;
            this.pid = pid;
            this.pState = pState;
            this.pLimit = 255;
            this.pPriority = pPriority;
            this.tsb = tsb;
        }
    }
} 