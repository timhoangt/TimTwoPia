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
            var process = _ReadyQueue.dequeue();
            _ReadyQueue.enqueue(process);
            var baseReg = process.pBase;
            var index: number = parseInt(addr, 16) + baseReg;  
            _Memory.memory[index] = data.toString(16);
            
            Control.updateMemoryTable(0);
        }
        public readMemory(addr){
            var baseReg = _ReadyQueue.q[0].pBase;
            var value = _Memory.memory[baseReg+addr];
            return value;
        }
}
}