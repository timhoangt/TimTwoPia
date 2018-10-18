///<reference path="../globals.ts" />
 /* ------------
     MEMORYACCESSOR.ts      
     Requires global.ts.
     ------------ */

module TSOS {

    export class MemoryAccessor {
        public memoryP1: boolean = false;
        public memoryP2: boolean = false;
        public memoryP3: boolean = false;

         public init(): void {
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
     }
}