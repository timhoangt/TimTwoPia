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
        public directoryTableSize:number;
        public dataTableSize:number;

        constructor() {
            super();
            this.driverEntry = this.krnFSDriverEntry;
            this.track = 8;
            this.sector = 8;
            this.block = 8;
            this.blockSize = 64;
            this.directoryTableSize =  this.sector * this.block;
            this.dataTableSize = (this.track-1) * this.sector * this.block;
        }
            
        public krnFSDriverEntry() {
            this.status = "loaded";
            if(sessionStorage){ //when a new session is booted
                if(sessionStorage.length == 0){
                    var tsb: string; 
                    var value = new Array<string>(); //array for file system
                    for (var i=0; i<4; i++){
                        value.push("0"); //pointer
                    }
                    while (value.length<this.blockSize){ //when smaller than block size
                        value.push("00"); //fill it in with 0s
                    }
                    for (var i=0; i<this.track; i++){ //tracks
                        for (var j=0; j<this.sector; j++){ //block subsections
                            for (var k=0; k<this.block; k++){ //block itself
                                tsb = i.toString() + j.toString() + k.toString();
                                sessionStorage.setItem(tsb, JSON.stringify(value));
                            }
                        }
                    }
                    Control.loadDiskTable();
                }
            }
            else{
                alert("Sorry, session storage is not available.");
            }
        }

        public formatDisk(): string{ //quick format
            var tsb: string;
            var value = new Array<string>();
            for (var i=0; i<sessionStorage.length;i++){ //for storage size
                var tsb = sessionStorage.key(i); 
                value = JSON.parse(sessionStorage.getItem(tsb));
                value[0] = "0" //reset the address registers to 0
                this.updateTSB(tsb,value); //clears values
            }
            return "Disk has been formatted.";
        }

        public formatFull(): string{ //full format
            var tsb: string;
            var value = new Array<string>();
            for (var i=0; i<sessionStorage.length;i++){ //for storage size
                var tsb = sessionStorage.key(i);
                this.zeroFill(tsb); //run zero fill (resets everything)
            }
            return "Disk has been full formatted.";
        }


        public zeroFill(tsb){ //for all address registers
            var value = value = JSON.parse(sessionStorage.getItem(tsb));
            for (var i=0; i<4; i++){
                value[i] = "0"; //reset address registers
            }
             for (var j=4; j<value.length; j++){
                value[j] = "00"; //reset data inside
            }
            this.updateTSB(tsb,value); //clears values
        }

        public createFile(filename): string{
            var createdFile:boolean = false; //have to check prereqs first
            var directoryTSB: string;
            var value = new Array<string>();
            var newFileName = new Array<string>(); //create file name
            var existFilename = this.lookupDataTSB(filename); //check if anotehr file has same name
            if (existFilename != null){ //error if same name
                return "ERROR! A file with that name already exists!";
            }
            else{
                for (var i=1; i<this.directoryTableSize; i++){ //for directoryectory size
                    var directoryTSB = sessionStorage.key(i); //give address register
                    value = JSON.parse(sessionStorage.getItem(directoryTSB));
                    if(value[0]=="0"){
                        this.zeroFill(directoryTSB);
                        value = JSON.parse(sessionStorage.getItem(directoryTSB));
                        var dataTSB = this.getTSB();
                        if(dataTSB != null){
                            value[0] = "1";
                            for (var k=1; k<4; k++){
                                value[k] = dataTSB.charAt(k-1);
                            }
                            newFileName = this.convertHex(filename.toString());
                            var index = 4;
                            while (newFileName.length>0){    
                                value[index] = newFileName.pop();
                                index++;
                            }
                            this.updateTSB(directoryTSB,value);
                            if (value[4] == "2E"){ //if it starts with a .
                                return filename + " Created a hidden file.";
                            }
                            else { //if normal name
                                return filename + " Created a file.";
                            }
                        }
                        else {
                            return "ERROR! Disk is full!";
                        }
                    }
                }
            }
            return "ERROR! directoryectory is full!";
        }

        public getTSB():string { //gets address register
            var dataTSB: string;
            var value = new Array<string>();
            for (var i=78; i<sessionStorage.length; i++){
                dataTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(dataTSB)); //checks if 0 or 1
                if(value[0]=="0"){
                    this.zeroFill(dataTSB); //resets
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    value[0]="1"; 
                    this.updateTSB(dataTSB,value); //changes to 1
                    return dataTSB; 
                }
            }
            return null;
        }

        public lookupDataTSB(filename):string { //searches for address register
            var directoryTSB: string;
            var dataTSB: string;
            var value = new Array<string>();
            var directoryFilename: string;
            for (var i=1; i<this.directoryTableSize; i++){ //for directoryectory size
                directoryTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(directoryTSB));
                if(value[0]=="1"){ //if address register is 1
                    directoryFilename = this.getFilename(value);//get the file
                    if (directoryFilename == filename){ //if names match
                        dataTSB = value.splice(1,3).toString().replace(/,/g,"");
                        value = JSON.parse(sessionStorage.getItem(dataTSB)); //get new
                        return dataTSB;
                    }
                    directoryFilename = "";
                }
            }
            return null;
        }

        public writeFile(filename, fileContent): string{ //writing files
            var dataTSB: string = this.lookupDataTSB(filename); //get the address register
            var content = new Array<string>(); 
            if(dataTSB != null){
                content = this.convertHex(fileContent); //fill in the data
                var fileCreated = this.editFileSystem(dataTSB, content); 
                if (fileCreated){
                    return filename + " - File written"; 
                }
                else{
                    return "ERROR! Disk is full!";
                }
            }
            else {
                return "ERROR! File does not exist!";
            }
        }

        public editFileSystem(dataTSB, content): boolean{ 
            var tsbUsed: string[] = new Array<string>(); 
            var firstTSB: string = dataTSB; //address registers
            var value = new Array<string>(); //array of values
            var valueIndex: number = 0;
            var firstIndex: number;
            value = JSON.parse(sessionStorage.getItem(dataTSB));
            var pointer: string = this.getPointer(value);
            if (pointer == "000"){ //if pointer is empty
                valueIndex = 4;
            }
            else {
                while(pointer!="-1-1-1"){ //if pointer is active
                    dataTSB = pointer;
                    tsbUsed.push(dataTSB); //get address register
                    value = JSON.parse(sessionStorage.getItem(dataTSB));
                    pointer = this.getPointer(value);                         
                }
                for(var i=4; i<value.length; i++){ //end of data
                    if(value[i]=="00"){
                        valueIndex = i;
                        break;
                    }
                }
            }
            firstIndex = valueIndex;
            while(content.length>0){
                if(valueIndex == this.blockSize){
                    var oldDataTSB: string = dataTSB;
                    dataTSB = this.getTSB();
                    tsbUsed.push(dataTSB);
                    if(dataTSB!=null){
                        for (var k=1; k<4; k++){
                            value[k] = dataTSB.charAt(k-1);
                        }
                        this.updateTSB(oldDataTSB,value); //gets new address register
                        value = JSON.parse(sessionStorage.getItem(dataTSB));
                        valueIndex = 4;
                    }
                    else{
                        for (var tsb in tsbUsed){ //resets address register
                            this.zeroFill(tsb);
                        }
                        for (var m=firstIndex; m<this.blockSize; m++){
                            value = JSON.parse(sessionStorage.getItem(firstTSB));
                            value[m] = "00"; //resets value
                            this.updateTSB(firstTSB,value);
                        }
                        return false;
                    }
                }   
                else{
                    value[valueIndex] = content.pop();
                    valueIndex++;
                }
            }
            for (var k=1; k<4; k++){
                value[k] = "-1";
            }
            this.updateTSB(dataTSB,value);
            return true;
        }

        public readFile(filename): string{
            var fileContent:string = filename + ": ";
            var dataTSB: string = this.lookupDataTSB(filename); //look up address
            var value = new Array<string>();
            var pointer: string; 
            var index: number;
            var charCode: number;
            if (dataTSB!=null){ //if address register is active
                value = JSON.parse(sessionStorage.getItem(dataTSB)); //get data
                pointer = this.getPointer(value);
                index = 4;
                while(index<this.blockSize && value[index]!="00"){ //dont retrive if empty
                    charCode = parseInt(value[index],16);
                    fileContent = fileContent + String.fromCharCode(charCode) //send data
                    index++;
                    if(index==this.blockSize && pointer!="-1-1-1"){ //if pointer is active
                        value = JSON.parse(sessionStorage.getItem(pointer));
                        pointer = this.getPointer(value); //get pointer
                        index = 4;
                    }
                }
                return fileContent; //send data in file
            }
            else{
                return "ERROR! File does not exist!";
            }
        }

        public deleteFile(filename): string{
            var dataTSB: string = this.lookupDataTSB(filename); //look up address register
            var directoryTSB: string;
            var value = new Array<string>();
            var pointer: string;
            if (dataTSB!=null){
                for(var i=0; i<this.directoryTableSize; i++){
                    directoryTSB = sessionStorage.key(i);
                    value = JSON.parse(sessionStorage.getItem(directoryTSB));
                    pointer = this.getPointer(value);
                    if(pointer == dataTSB){
                        value[0] = "0"; //if pointer isnt active
                        this.updateTSB(directoryTSB,value);
                        break;
                    }
                }
                pointer = this.deleteHelper(dataTSB);
                if(pointer != "000"){
                    while(pointer != "-1-1-1"){ //if pointer is active
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
            Control.updateDiskTable(tsb); //send data to control.js
        }

        public getPointer(value): string{
            var pointer: string = value[1] + value[2] + value[3]; //pointer is the three digit number
            return pointer;
        }

        public getFilename(value): string{
            var index = 4;
            var letter;
            var directoryFilename:string = "";
            while(value[index]!="00" && index<this.blockSize){ //gets file name from block
                letter = String.fromCharCode(parseInt(value[index],16));
                directoryFilename = directoryFilename + letter;
                index++;
            }
            return directoryFilename;
        }

        public deleteHelper(tsb): string{
            var value = JSON.parse(sessionStorage.getItem(tsb)); //gets address register
            value[0]="0";
            this.updateTSB(tsb,value);
            var pointer = this.getPointer(value);
            return pointer;
        }

        public listFiles(): string[]{ 
            var directoryTSB: string; 
            var value = new Array<string>();  //makes title from data
            var directoryFilename: string;
            var files = new Array<string>(); //makes array of titles
            for (var i=1; i<this.directoryTableSize; i++){ //for table size
                directoryTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(directoryTSB)); //get from address registers
                if(value[0]=="1" && value[4]!="2E"){ //not hidden
                    directoryFilename = this.getFilename(value);
                    files.push(directoryFilename);
                    directoryFilename = "";
                }
            }
            return(files);
        }

        public listHiddenFiles(): string[]{
            var directoryTSB: string;
            var value = new Array<string>();//makes title from data
            var directoryFilename: string;
            var files = new Array<string>();//makes array of titles
            for (var i=1; i<this.directoryTableSize; i++){//for table size
                directoryTSB = sessionStorage.key(i);
                value = JSON.parse(sessionStorage.getItem(directoryTSB)); //get from address registers
                if(value[0]=="1"){ //all files
                    directoryFilename = this.getFilename(value);
                    files.push(directoryFilename);
                    directoryFilename = "";
                }
            }
            return(files);
        }

        public convertHex(string): string[]{
            var asciiHex= new Array<string>(); //converts to ASCII
            var hexVal:string;
            for(var i=string.length - 1; i>=0; i--){
                hexVal = string.charCodeAt(i).toString(16);
                asciiHex.push(hexVal.toUpperCase()); 
            }
            return asciiHex;
        }

        public writeProcess(programInput): string{
            var dataTSB: string = this.getTSB();
            var content = new Array<string>();
            if(dataTSB != null){
                while(programInput.length>0){
                    content.push(programInput.pop());
                }
                var processLoaded = this.editFileSystem(dataTSB, content); //when loaded, add into FS
                if (processLoaded){
                    return dataTSB; //return the address register
                }
                else{
                    return null;
                }
            }
            else {
                return null;
            }
        }

        public retrieveProcess(tsb): string[]{
            var value:string[] = JSON.parse(sessionStorage.getItem(tsb));
            var programInput = new Array<string>();
            var pointer: string = this.getPointer(value);//gets address register
            var index: number = 4;
            var opCode: string;
            while (pointer!="-1-1-1"){ //if bigger than one block
                while (index<value.length){
                    opCode = value[index]; 
                    programInput.push(opCode);
                    index++; //gets data
                }
                value[0] = "0"; //empties block
                this.updateTSB(tsb, value);
                value = JSON.parse(sessionStorage.getItem(pointer));
                pointer = this.getPointer(value);
                index = 4;
            }
            while (index<value.length){ //adds to previous block
                opCode = value[index];
                programInput.push(opCode);
                index++;
            }
            value[0] = "0"; //empties block again
            this.updateTSB(tsb, value);
            if (programInput.length > 256){ //splices it into smaller sections
                programInput.splice(256,(programInput.length-256));
            }
            return programInput;
        }
    }
}