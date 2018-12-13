///<reference path="../globals.ts" />
 /* ------------
     swapper.ts
      Requires global.ts.
     ------------ */
module TSOS {
    export class Swapper {

        public swapProcess(tsb, baseReg, limitReg): string{
            var newLocs = new Array<string>();
            var loadprogramInput = new Array<string>();
            var opCode: string;
            var saveprogramInput: string[] = _MemoryAccessor.retreiveMemory(baseReg, limitReg); //get program from memory
            saveprogramInput = this.trimprogramInput(saveprogramInput); 
            var newTSB:string = _krnFileSystemDriver.writeProcess(saveprogramInput); //put into disk
            if (newTSB){ //when address register active
                _MemoryManager.clearPartition(baseReg); //reset partition
                loadprogramInput = _krnFileSystemDriver.retrieveProcess(tsb); //load program from disk
                loadprogramInput = this.trimprogramInput(loadprogramInput);
                for(var j=0; j<loadprogramInput.length; j++){
                    _MemoryAccessor.appendMemory(baseReg, baseReg+j, loadprogramInput[j]);
                }
                return newTSB;
            }
            else{
                return null; //if no space
            }
        }

        public trimprogramInput(programInput): string[]{ //ignores empty data
            var opCode = programInput.pop();
            while (opCode == "00"){ //if empty data
                opCode = programInput.pop();
            }
            programInput.push(opCode);
            return programInput;
        }
    }
} 