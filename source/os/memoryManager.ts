///<reference path="../globals.ts" />
 /* ------------
memoryAccessor.ts
Requires global.ts.
------------ */
module TSOS {
export class MemoryManager {
     public loadOpCodes(programInput){
        var inputOpCodes: string[] = programInput.split(" ");
        console.log(inputOpCodes);                
        var baseReg: number;
        var limitReg: number;
        if (_Memory.memoryP1){
            if(_Memory.memoryP2){
                if(_Memory.memoryP3){
                    _StdOut.putText("Memory is full. Please wait to load");
                } else{
                    _Memory.memoryP3 = true;
                    baseReg = 512;
                }
            } else{
                _Memory.memoryP2 = true; 
                baseReg = 256;
            }
        } else{
            _Memory.memoryP1 = true;
            baseReg = 0;
        }
        for (var i = baseReg; i <inputOpCodes.length; i++){
            _Memory.memory[i] = inputOpCodes[i];
            console.log("i = " + i);
        }
        console.log(_Memory.memory);
        _Memory.updateTable(baseReg);
        return baseReg;
    }   
}
} 