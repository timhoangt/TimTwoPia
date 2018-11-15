///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

 /* ----------------------------------
   DeviceDriverFileSystem.ts

    Requires deviceDriver.ts

    The File System Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFileSystem extends DeviceDriver {

        constructor() {
                super();
                this.driverEntry = this.krnFSDriverEntry;
            }
            
        public krnFSDriverEntry() {
            this.status = "loaded";
            if(sessionStorage){
                var tsb: string;
                var value: string = "0";
                while (value.length<64){
                    value = value + "0";
                }
                for (var i=0; i<8; i++){
                    for (var j=0; j<78; j++){
                        tsb = j.toString();
                        if (tsb.length<2){
                            tsb = "0" + tsb;
                        } 
                        tsb = i.toString() + tsb;
                        sessionStorage.setItem(tsb, value);
                    }
                }
                var sessionLength = sessionStorage.length
            } 
            else{
                alert("Session Storage not allowed.");
            }
        }

    }
}