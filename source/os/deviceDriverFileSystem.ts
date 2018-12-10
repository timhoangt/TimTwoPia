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
        public track: number;
        public sector: number;
        public block:number;
        public blockSize:number;
        public dirTableSize:number;
        public dataTableSize:number;

        constructor() {
            super();
            this.driverEntry = this.krnFSDriverEntry;
            this.track = 8;
            this.sector = 8;
            this.block = 8;
            this.blockSize = 64;
            this.dirTableSize =  this.sector * this.block;
            this.dataTableSize = (this.track-1) * this.sector * this.block;
        }
            
        public krnFSDriverEntry() {
            this.status = "loaded";
            if(sessionStorage){
                if(sessionStorage.length == 0){
                    var tsb: string;
                    var value = new Array<string>();
                    for (var i=0; i<4; i++){
                        value.push("0");
                    }
                    while (value.length<this.blockSize){
                        value.push("00");
                    }
                    for (var i=0; i<this.track; i++){
                        for (var j=0; j<this.sector; j++){
                            for (var k=0; k<this.block; k++){
                                tsb = i.toString() + j.toString() + k.toString();
                                sessionStorage.setItem(tsb, JSON.stringify(value));
                            }
                        }
                    }
                }
            }
            else{
                alert("Sorry, your browser do not support session storage.");
            }
        }

        public formatDisk(){
            var tsb: string;
            var value = new Array<string>();
            for (var i=0; i<sessionStorage.length;i++){
                var tsb = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "0"
                this.updateTSB(tsb,value);
            }
            return "Disk has been formatted.";
        }


        public zeroFill(tsb){
            var value = value = JSON.parse(sessionStorage.getItem(tsb));
            for (var i=0; i<4; i++){
                value[i] = "0";
            }
             for (var j=4; j<value.length; j++){
                value[j] = "00";
            }
            this.updateTSB(tsb,value);
        }

        public createFile(filename): string{
            var createdFile:boolean = false;
            var dirTSB: string;
            var value = new Array<string>();
            var asciiFilename: string;
            var existFilename = this.lookupDataTSB(filename);
            if (existFilename != null){
                return "ERROR! A file with that name already exists!";
            }
            else{
                for (var i=1; i<this.dirTableSize; i++){
                    var dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    if(value[0]=="0"){
                        this.zeroFill(dirTSB);
                        value = JSON.parse(sessionStorage.getItem(dirTSB));
                        var dataTSB = this.findDataTSB();
                        if(dataTSB != null){
                            value[0] = "1";
                            for (var k=1; k<4; k++){
                                value[k] = dataTSB.charAt(k-1);
                            }
                            asciiFilename = filename.toString();
                            for (var j=0; j<asciiFilename.length; j++){
                                value[j+4] = asciiFilename.charCodeAt(j).toString(16).toUpperCase();
                            }
                            this.updateTSB(dirTSB,value);
                            return filename + " - File created";
                        }
                        else {
                            return "ERROR! Disk is full!";
                        }
                    }
                }
            }
            return "ERROR! Directory is full!";
        }

        public findDataTSB():string {
            var dataTSB: string;
            var value = new Array<string>();
            for (var i=78; i<sessionStorage.length; i++){
                dataTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                if(value[0]=="0"){
                    this.zeroFill(dataTSB);
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    value[0]="1";
                    this.updateTSB(dataTSB,value);
                    return dataTSB; 
                }
            }
            return null;
        }

        public lookupDataTSB(filename):string {
            var dirTSB: string;
            var dataTSB: string;
            var value = new Array<string>();
            var dirFilename: string;
            for (var i=1; i<this.dirTableSize; i++){
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if(value[0]=="1"){
                    dirFilename = this.getFilename(value);
                    if (dirFilename == filename){
                        dataTSB = value.splice(1,3).toString().replace(/,/g,"");
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        return dataTSB;
                    }
                    dirFilename = "";
                }
            }
            return null;
        }

        public writeFile(filename, fileContent): string{
            var tsbUsed: string[] = new Array<string>();
            var dataTSB: string = this.lookupDataTSB(filename);
            var firstTSB: string = dataTSB;
            var value = new Array<string>();
            var charCode;
            if(dataTSB != null){
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                var contentIndex: number = 0;
                var valueIndex: number = 0;
                var firstIndex: number;
                var pointer: string = this.getPointer(value);
                if (pointer == "000"){
                    valueIndex = 4;                     
                }
                else {
                    while(pointer!="-1-1-1"){
                        dataTSB = pointer;
                        tsbUsed.push(dataTSB);
                        value = JSON.parse(sessionStorage.getItem(dataTSB));      
                        pointer = this.getPointer(value); 
                    }
                    for(var i=4; i<value.length; i++){
                        if(value[i]=="00"){
                            valueIndex = i;
                            break;
                        }
                    }
                }
                firstIndex = valueIndex;
                while(contentIndex<fileContent.length){
                    if(valueIndex == this.blockSize){
                        var oldDataTSB: string = dataTSB;
                        dataTSB = this.findDataTSB();
                        tsbUsed.push(dataTSB);
                        if(dataTSB!=null){
                            for (var k=1; k<4; k++){
                                value[k] = dataTSB.charAt(k-1);
                            }
                            this.updateTSB(oldDataTSB,value);
                            value = JSON.parse(sessionStorage.getItem(dataTSB));
                            valueIndex = 4;
                        }
                        else{
                            for (var dataTSB in tsbUsed){
                                this.zeroFill(dataTSB);
                            }
                            for (var m=firstIndex; m<this.blockSize; m++){
                                value = JSON.parse(sessionStorage.getItem(firstTSB));
                                value[m] = "00";
                                this.updateTSB(firstTSB,value);
                            }
                            return "ERROR! Disk is full!";
                        }
                    }
                    else{
                        charCode = fileContent.charCodeAt(contentIndex);
                        value[valueIndex] = charCode.toString(16).toUpperCase();
                        contentIndex++;
                        valueIndex++;
                    }
                }
                for (var k=1; k<4; k++){
                value[k] = "-1";
            }
            this.updateTSB(firstTSB,value);
            return filename + " - File written";
            }
            else{
                return "ERROR! File does not exist!";
            }
        }

        public readFile(filename): string{
            var fileContent:string = filename + ": ";
            var dataTSB: string = this.lookupDataTSB(filename);
            var value = new Array<string>();
            var pointer: string;
            var index: number;
            var charCode: number;
            if (dataTSB!=null){
                value = JSON.parse(sessionStorage.getItem(dataTSB));
                pointer = this.getPointer(value);
                index = 4;
                while(index<this.blockSize && value[index]!="00"){
                    charCode = parseInt(value[index],16);
                    fileContent = fileContent + String.fromCharCode(charCode)
                    index++;
                    if(index==this.blockSize && pointer!="-1-1-1"){
                        value = JSON.parse(sessionStorage.getItem(pointer));
                        pointer = this.getPointer(value);
                        index = 4;
                    }
                }
                return fileContent;
            }
            else{
                return "ERROR! File does not exist!";
            }
        }

        public deleteFile(filename): string{
            var dataTSB: string = this.lookupDataTSB(filename);
            var dirTSB: string;
            var value = new Array<string>();
            var pointer: string;
            if (dataTSB!=null){
                for(var i=0; i<this.dirTableSize; i++){
                    dirTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(dirTSB));
                    pointer = this.getPointer(value);
                    if(pointer == dataTSB){
                        value[0] = "0";
                        this.updateTSB(dirTSB,value);
                        break;
                    }
                }
                pointer = this.deleteHelper(dataTSB);
                if(pointer != "000"){
                    while(pointer != "-1-1-1"){
                        dataTSB = pointer;
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        value[0]="0";
                        sessionStorage.setItem(dataTSB, JSON.stringify(value));
                        Control.updateDiskTable(dataTSB);
                        pointer = value[1] + value[2] + value[3];
                    }
                }
                return "File was deleted.";
            }
            else {
                return "ERROR! File does not exist!";
            }
        }

        public updateTSB(tsb, value){
            sessionStorage.setItem(tsb,JSON.stringify(value));
            Control.updateDiskTable(tsb);
        }

        public getPointer(value): string{
            var pointer: string = value[1] + value[2] + value[3];
            return pointer;
        }

        public getFilename(value): string{
            var index = 4;
            var letter;
            var dirFilename:string = "";
            while(value[index]!="00" && index<this.blockSize){
                letter = String.fromCharCode(parseInt(value[index],16));
                dirFilename = dirFilename + letter;
                index++;
            }
            return dirFilename;
        }

        public deleteHelper(tsb): string{
            var value = JSON.parse(sessionStorage.getItem(tsb));
            value[0]="0";
            this.updateTSB(tsb,value);
            var pointer = this.getPointer(value);
            return pointer;
        }

        public listFiles(): string[]{
            var dirTSB: string;
            var value = new Array<string>();
            var dirFilename: string;
            var files = new Array<string>();
            for (var i=1; i<this.dirTableSize; i++){
                dirTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dirTSB));
                if(value[0]=="1"){
                    dirFilename = this.getFilename(value);
                    files.push(dirFilename);
                    dirFilename = "";
                }
            }
            return(files);
        }
    }
}