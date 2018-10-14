var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(pBase) {
            this.pid = -1; //gets pID
            this.pCounter = 0; //points to instructions
            this.pAcc = 0;
            this.pXreg = 0;
            this.pYreg = 0;
            this.pZflag = 0;
            this.pPriority = 0;
            this.pState = "New";
            this.pLocation = "Memory";
            this.pLimit = 256;
            this.pBase = pBase;
            this.pid++;
            this.pState = "Resident";
        }
        PCB.prototype.getPid = function () {
            return this.pid;
        };
        PCB.prototype.getPBase = function () {
            return this.pBase;
        };
        PCB.prototype.getPLimit = function () {
            return this.pLimit;
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
