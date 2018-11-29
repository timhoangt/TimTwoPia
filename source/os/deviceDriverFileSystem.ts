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
                var value = new Array<string>();
                while (value.length<65){
                    value.push("00");
                }
                for (var i=0; i<8; i++){
                    for (var j=0; j<78; j++){
                        tsb = j.toString();
                        if (tsb.length<2){
                            tsb = "0" + tsb;
                        } 
                        tsb = i.toString() + tsb;
                        sessionStorage.setItem(tsb, JSON.stringify(value));
                    }
                }
                var sessionLength = sessionStorage.length;
            } 
            else{
                alert("Session Storage not allowed.");
            }
        }

        public formatDisk(){
            var tsb: string;
            var value = new Array<string>();
            for (var i=0; i<8; i++){
                for (var j=0; j<78; j++){
                    tsb = j.toString();
                    if (tsb.length<2){
                        tsb = "0" + tsb;
                    } 
                    tsb = i.toString() + tsb;
                    value = JSON.parse(sessionStorage.getItem(tsb));
                    value[0] = "00"
                    sessionStorage.setItem(tsb,JSON.stringify(value));
                }
            }
            var sessionLength = sessionStorage.length;
        }


        public createFile(): boolean{
            return;
        }
    }
}