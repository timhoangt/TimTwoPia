///<reference path="../globals.ts" />
 /* ------------
     MEMORYACCESSOR.ts      
     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryAccessor {
        public init(): void {
            Control.loadMemoryTable();
        }

        public writeMemory(addr, data){
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index: number = parseInt(addr, 16) + baseReg;
            if(index > limitReg){
                _KernelInterruptQueue.enqueue(new Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            } 
            else {
                _Memory.memory[index] = data.toString(16);
                // 0 for now bc only one parition
                Control.updateMemoryTable(baseReg);
            }
        }
        public readMemory(addr){
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index: number = baseReg + addr;
            if (index > limitReg){
                _KernelInterruptQueue.enqueue(new Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else{
                var value = _Memory.memory[index];
                return value;
            }
        }
}
}