///<reference path="../globals.ts" />
 /* ------------
 MEMORY.ts
  Requires global.ts.
 ------------ */
module TSOS {
  export class Memory {
    
    //our memory is the set of bytes we made
    public memory: string[];


    //initializes memory
    public init(): void {
      this.memory = new Array<string>();
      for (var i = 0; i<768; i++){
        this.memory.push("00");
      }
    }
  }
}