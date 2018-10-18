///<reference path="../globals.ts" />
 /* ------------
 MEMORY.ts
  Requires global.ts.
 ------------ */
module TSOS {
  export class Memory {
    
    public memory: string[];
    public memoryP1: boolean = false;
    public memoryP2: boolean = false;
    public memoryP3: boolean = false;

    public init(): void {
      this.memory = new Array<string>();
      for (var i = 0; i<768; i++){
        this.memory.push("00");
      }
      
      this.memoryP1 = false;
      this.memoryP2 = false;
      this.memoryP3 = false;

      Control.loadMemoryTable();
    }
  }
}