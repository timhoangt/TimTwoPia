///<reference path="../globals.ts" />
 /* ------------
memoryManager.ts
Requires global.ts.
------------ */
module TSOS {
    export class MemoryManager {

        // sees if anything is in each partition
        public memoryP1: boolean = false;
        public memoryP2: boolean = false;
        public memoryP3: boolean = false;

         public loadMemory(inputOpCodes){           
            var baseReg: number;
            //gives id of empty partition
            if (this.memoryP1){
                //fills partition
                if(this.memoryP2){
                    if(this.memoryP3){
                        // memory is full
                        baseReg = 999;
                    } 
                    else{
                        this.memoryP3 = true;
                        baseReg = 512;
                    }
                } 
                else{
                    this.memoryP2 = true; 
                    baseReg = 256;
                }
            }
            else{
                this.memoryP1 = true;
                baseReg = 0;
            }
            //puts program in the partition
            if(baseReg==999){
                
            }
            else{ // load user program into memory
                for (var i = 0; i <inputOpCodes.length; i++){
                    _Memory.memory[baseReg+i] = inputOpCodes[i];
                }
            Control.updateMemoryTable(baseReg);//updates table
            }
            return baseReg;
        }


        //once executed, empties partition
        public clearPartition(baseReg) : void{
            for (var i = baseReg; i <= baseReg+255; i++){
                _Memory.memory[i] = "00";
            }
            if(baseReg==0){
                this.memoryP1 = false;
                }
                else if(baseReg==256){
                    this.memoryP2 = false;
                }
                else {
                    this.memoryP3 = false;
            }
            Control.updateMemoryTable(baseReg);
        }

        public clearMemory(): void{
            // wipes memory clean
            this.clearPartition(0);
            this.memoryP1 = false;
            this.clearPartition(256);
            this.memoryP2 = false;
            this.clearPartition(512);
            this.memoryP3 = false;
        }
    }
} 