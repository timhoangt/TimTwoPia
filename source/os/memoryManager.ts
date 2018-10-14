///<reference path="../globals.ts" />
 /* ------------
memoryAccessor.ts
Requires global.ts.
------------ */
module TSOS {
export class MemoryManager {
     public loadMemory(inputOpCodes){           
        var baseReg: number;
        if (_Memory.memoryP1){ //assigns three partitions with a set amount of space
            baseReg = 999;
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

    public readMemory(pBase, pLimit){
        var opCode: string[] = [];
        for (var i = pBase; i <= pLimit; i ++){
            opCode.push(_Memory.memory[i]);
        }
        return opCode;
    }

    public updateMemory(addr, data) : void{
        var index: number = parseInt(addr, 16);                 
        _Memory.memory[index] = data.toString(16);
        _Memory.updateTable(0);
    }

    public clearPartition(pBase) : void{
        for (var i = pBase; i <= pBase+255; i++){
            _Memory.memory[i] = "00";
        }
        _Memory.memoryP1 = false;
        _Memory.updateTable(pBase);
    }
}
} 