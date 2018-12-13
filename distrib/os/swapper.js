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
            var loadprogramInput = new Array();
            var opCode;
            var saveprogramInput = _MemoryAccessor.retreiveMemory(baseReg, limitReg); //get program from memory
            saveprogramInput = this.trimprogramInput(saveprogramInput);
            var newTSB = _krnFileSystemDriver.writeProcess(saveprogramInput); //put into disk
            if (newTSB) { //when address register active
                _MemoryManager.clearPartition(baseReg); //reset partition
                loadprogramInput = _krnFileSystemDriver.retrieveProcess(tsb); //load program from disk
                loadprogramInput = this.trimprogramInput(loadprogramInput);
                for (var j = 0; j < loadprogramInput.length; j++) {
                    _MemoryAccessor.appendMemory(baseReg, baseReg + j, loadprogramInput[j]);
                }
                return newTSB;
            }
            else {
                return null; //if no space
            }
        };
        Swapper.prototype.trimprogramInput = function (programInput) {
            var opCode = programInput.pop();
            while (opCode == "00") { //if empty data
                opCode = programInput.pop();
            }
            programInput.push(opCode);
            return programInput;
        };
        return Swapper;
    }());
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
