var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(pBase, pid, pState, pPriority) {
            this.pCounter = 0; //points to instructions
            //public pIR: string = "00";
            this.pAcc = 0;
            this.pXreg = 0;
            this.pYreg = 0;
            this.pZflag = 0;
            this.pPriority = 0;
            this.pLocation = "Memory";
            this.turnaroundTime = 0;
            this.waitTime = 0;
            this.pBase = pBase;
            this.pid = pid;
            this.pState = pState;
            this.pLimit = 255;
            this.pPriority = pPriority;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
