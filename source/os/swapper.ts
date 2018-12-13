///<reference path="../globals.ts" />
 /* ------------
     swapper.ts
      Requires global.ts.
     ------------ */
module TSOS {
    export class Swapper {
        public swapProcess(tsb, baseReg, limitReg): string{
            var newLocs = new Array<string>();
            var loadUserPrg = new Array<string>();
            var opCode: string;
            var saveUserPrg: string[] = _MemoryAccessor.retreiveMemory(baseReg, limitReg);
            saveUserPrg = this.trimUserPrg(saveUserPrg);
            var newTSB:string = _krnFileSystemDriver.saveProcess(saveUserPrg);
            if (newTSB){
                _MemoryManager.clearPartition(baseReg);
                loadUserPrg = _krnFileSystemDriver.retrieveProcess(tsb);
                loadUserPrg = this.trimUserPrg(loadUserPrg);
                for(var j=0; j<loadUserPrg.length; j++){
                    _MemoryAccessor.appendMemory(baseReg, baseReg+j, loadUserPrg[j]);
                }
                return newTSB;
            }
            else{
                return null;
            }
        }
        public trimUserPrg(userPrg): string[]{
            var opCode = userPrg.pop();
            while (opCode == "00"){
                opCode = userPrg.pop();
            }
            userPrg.push(opCode);
            return userPrg;
        }
    }
} 