///<reference path="../globals.ts" />
 /* ------------
     MEMORYACCESSOR.ts      
     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryAccessor {
        public init(): void {
        }

        public writeMemory(addr, data){
            var baseReg = _RunningpBase;
            var index: number = parseInt(addr, 16) + baseReg;  
            _Memory.memory[index] = data.toString(16);
            
            Control.updateMemoryTable(0);
        }
        public readMemory(addr){
            var baseReg = _RunningpBase;
            var value = _Memory.memory[baseReg+addr];
            return value;
        }
}
}