///<reference path="../globals.ts" />
/* ------------
    swapper.ts
     Requires global.ts.
    ------------ */
var TSOS;
(function (TSOS) {
    var Swapper = /** @class */ (function () {
        function Swapper() {
        }
        Swapper.prototype.swapProcess = function (tsb, baseReg, limitReg) {
            var newLocs = new Array();
            var loadUserPrg = new Array();
            var opCode;
            var saveUserPrg = _MemoryAccessor.retreiveMemory(baseReg, limitReg);
            saveUserPrg = this.trimUserPrg(saveUserPrg);
            var newTSB = _krnFileSystemDriver.saveProcess(saveUserPrg);
            if (newTSB) {
                _MemoryManager.clearPartition(baseReg);
                loadUserPrg = _krnFileSystemDriver.retrieveProcess(tsb);
                loadUserPrg = this.trimUserPrg(loadUserPrg);
                for (var j = 0; j < loadUserPrg.length; j++) {
                    _MemoryAccessor.appendMemory(baseReg, baseReg + j, loadUserPrg[j]);
                }
                return newTSB;
            }
            else {
                return null;
            }
        };
        Swapper.prototype.trimUserPrg = function (userPrg) {
            var opCode = userPrg.pop();
            while (opCode == "00") {
                opCode = userPrg.pop();
            }
            userPrg.push(opCode);
            return userPrg;
        };
        return Swapper;
    }());
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
