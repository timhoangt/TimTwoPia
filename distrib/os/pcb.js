var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(pBase, pid) {
            this.pCounter = 0; //points to instructions
            //public pIR: string = "00";
            this.pAcc = 0;
            this.pXreg = 0;
            this.pYreg = 0;
            this.pZflag = 0;
            this.pPriority = 0;
            this.pState = "New";
            this.pLocation = "Memory";
            this.pBase = pBase;
            this.pid = pid;
            this.pState = "Resident";
            this.pLimit = 255;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
