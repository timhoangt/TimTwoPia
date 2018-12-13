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
            //checks the register for the current program for the first address
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index: number = parseInt(addr, 16) + baseReg;
            if(index > limitReg){ //if there is not enough space get access error
                _KernelInterruptQueue.enqueue(new Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            } 
            else { //update memory table
                _Memory.memory[index] = data.toString(16);
                Control.updateMemoryTable(baseReg);
            }
        }

        public readMemory(addr){
            //checks the register for the current program for the first address
            var baseReg = _CpuScheduler.runningProcess.pBase;
            var limitReg = baseReg + 255;
            var index: number = baseReg + addr;
            if (index > limitReg){ //if there is not enough space get access error
                _KernelInterruptQueue.enqueue(new Interrupt(ACCESS_IRQ, _CpuScheduler.runningProcess.pid));
            }
            else{ //pulls the data in the memory
                var value = _Memory.memory[index];
                return value;
            }
        }

        //gets data from disk and turns it into string
        public retreiveMemory(baseReg, limitReg):string[]{
            var value: string[] = _Memory.memory.slice(baseReg,(baseReg+limitReg+1));
            return value;
        }
        
        //puts data into disk
        public appendMemory(baseReg,index,data){
            _Memory.memory[index] = data.toString(16).toUpperCase();
            Control.updateMemoryTable(baseReg);
        }
    }
}