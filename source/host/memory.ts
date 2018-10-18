///<reference path="../globals.ts" />
 /* ------------
 MEMORY.ts
  Requires global.ts.
 ------------ */
module TSOS {
  export class Memory {
    
    //our memory is the set of bytes we made
    public memory: string[];

    //see if partition has content
    public memoryP1: boolean = false;
    public memoryP2: boolean = false;
    public memoryP3: boolean = false;

    //initializes memory
    public init(): void {
      this.memory = new Array<string>();
      for (var i = 0; i<768; i++){
        this.memory.push("00");
      }
      
      //shows which partitions exist
      this.memoryP1 = false;
      this.memoryP2 = false;
      this.memoryP3 = false;

      Control.loadMemoryTable();
    }
  }
}