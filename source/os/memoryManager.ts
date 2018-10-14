///<reference path="../globals.ts" />
 /* ------------
memoryAccessor.ts
Requires global.ts.
------------ */
module TSOS {
export class MemoryManager {
     public loadOpCodes(programInput){
        var inputOpCodes: string[] = programInput.split(" ");               
        var baseReg: number;
        var limitReg: number;
        if (_Memory.memoryP1){ //assigns three partitions with a set amount of space
            if(_Memory.memoryP2){
                if(_Memory.memoryP3){
                    _StdOut.putText(" Memory is full. Wait until more is available."); //error if you used all three partitions
                }
                else{
                	_Memory.memoryP3 = true;
                    baseReg = 512;
                }
            }
            else{
                _Memory.memoryP2 = true; 
                baseReg = 256;
            }
        }
        else{
            _Memory.memoryP1 = true;
            baseReg = 0;
        }
        for (var i = baseReg; i <inputOpCodes.length; i++){
            _Memory.memory[i] = inputOpCodes[i]; //program is put in the memory partition
        }
        _Memory.updateTable(baseReg); //updates table
        return baseReg;
    }   
}
} 