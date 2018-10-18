///<reference path="../globals.ts" />
 /* ------------
memoryManager.ts
Requires global.ts.
------------ */
module TSOS {
    export class MemoryManager {
         public loadMemory(inputOpCodes){           
            var baseReg: number;
            if (_Memory.memoryP1){
                baseReg = 999;
            }
            else{
                _Memory.memoryP1 = true;
                baseReg = 0;
            }
            for (var i = baseReg; i <inputOpCodes.length; i++){
                _Memory.memory[i] = inputOpCodes[i]; //program is put in the memory partition
            }
            Control.updateMemoryTable(baseReg); //updates table
            return baseReg;
        }

        public readMemory(index){
            var opCode: string = _Memory.memory[index];
            return opCode;
        }

        public updateMemory(addr, data) : void{
            var index: number = parseInt(addr, 16);                 
            _Memory.memory[index] = data.toString(16);
            Control.updateMemoryTable(0);
        }

        public clearPartition(baseReg) : void{
            for (var i = baseReg; i <= baseReg+255; i++){
                _Memory.memory[i] = "00";
            }
            if(baseReg==0){
                _Memory.memoryP1 = false;
            }
            Control.updateMemoryTable(baseReg);
        }
    }
} 