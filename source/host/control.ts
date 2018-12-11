///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {



        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taTime")).value="";

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taStatus")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }

        //loaded after startup
        public static loadMemoryTable(): void {
            var memoryContainer: HTMLDivElement = <HTMLDivElement> document.getElementById("memoryContainer");
            var memoryTable: HTMLTableElement = <HTMLTableElement> document.createElement("table");
            memoryTable.className = "taMemory";
            memoryTable.id = "taMemory";
            var memoryTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.createElement("tbody");
            //enough space for 12 bytes
            for (var i = 0; i < 96; i++){
                //one byte rows being made
                var row: HTMLTableRowElement = <HTMLTableRowElement> document.createElement("tr");
                row.id = "memoryRow-" + (8*i);
                var cell: HTMLTableCellElement = <HTMLTableCellElement> document.createElement("td");
                var val: number = 8*i;
                //writing values of each inital bit
                var hexVal: string = "000" + val.toString(16).toUpperCase();
                var cellText = document.createTextNode(hexVal.slice(-4));
                cell.id = "byte" + hexVal.slice(-4);
                cell.appendChild(cellText);
                row.appendChild(cell);        
                for (var j = 0; j < 8; j++) {
                    cell = document.createElement("td");
                    var index: number = j + (8 * i);
                    var id: string = "000" + index.toString(16).toUpperCase();
                    var memoryValue: string = _Memory.memory[index];
                    cellText = document.createTextNode(memoryValue);
                    cell.id = id.slice(-4);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                memoryTableBody.appendChild(row);
            }
            memoryTable.appendChild(memoryTableBody);
            memoryContainer.appendChild(memoryTable);
        }

        //loaded at each load command
        public static updateMemoryTable(baseReg): void {
            var memoryTable: HTMLTableElement = <HTMLTableElement> document.getElementById("taMemory");
            var rowId: string;
            var index: number;                    
            var cellId: string;
            for (var i = 0; i < 32 ; i++){
                rowId = "memoryRow-" + ((8*i)+baseReg);
                for (var j = 0; j < 8; j ++){
                    index = j + ((8 * i)+baseReg);
                    //writing values of each loaded bit
                    var id: string = "000" + index.toString(16).toUpperCase();                            
                    cellId = id.slice(-4);                            
                    memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = _Memory.memory[index];
                }
            }
        }

        //runs on load
        public static addProcessTable(process): void {
            //adds new process to the table
            var processTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.getElementById("processTbody");         
            var row: HTMLTableRowElement = <HTMLTableRowElement> document.createElement("tr");
            row.id = "pid" + process.pid;
            var cell: HTMLTableCellElement = <HTMLTableCellElement> document.createElement("td");

            //initializes pID, PC, IR, ACC,X, Y, Z, State, Location
            var cellText = document.createTextNode(process.pid);
            cell.appendChild(cellText);
            row.appendChild(cell);

            cell = document.createElement("td");            
            cellText = document.createTextNode(process.pCounter);
            cell.appendChild(cellText);
            row.appendChild(cell);

            cell = document.createElement("td");            
            cellText = document.createTextNode("0");
            cell.appendChild(cellText);
            row.appendChild(cell);


            cell = document.createElement("td");            
            cellText = document.createTextNode(process.pAcc);
            cell.appendChild(cellText);
            row.appendChild(cell);

            cell = document.createElement("td");            
            cellText = document.createTextNode(process.pXreg);
            cell.appendChild(cellText);
            row.appendChild(cell);

            cell = document.createElement("td");            
            cellText = document.createTextNode(process.pYreg);
            cell.appendChild(cellText);
            row.appendChild(cell);

            cell = document.createElement("td");            
            cellText = document.createTextNode(process.pZflag);
            cell.appendChild(cellText);
            row.appendChild(cell);

            cell = document.createElement("td");            
            cellText = document.createTextNode(process.pState);
            cell.appendChild(cellText);
            row.appendChild(cell);

            cell = document.createElement("td");            
            cellText = document.createTextNode(process.pLocation);
            cell.appendChild(cellText);
            row.appendChild(cell);
            processTableBody.appendChild(row);
        } 

        public static updateProcessTable(pid, pState): void{
            var processTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.getElementById("processTbody");                
            var row: HTMLTableRowElement = <HTMLTableRowElement> document.getElementById("pid"+pid);
            var pc = _CPU.PC.toString(16).toUpperCase();
            if(pc.length == 1){
                pc = "0" + pc;
            }
            //updates PC, IR, ACC, X, Y, Z, State
            row.cells.item(1).innerHTML = pc;
            row.cells.item(2).innerHTML = _CPU.IR;
            row.cells.item(3).innerHTML = _CPU.Acc.toString(16);
            row.cells.item(4).innerHTML = _CPU.Xreg.toString(16);
            row.cells.item(5).innerHTML = _CPU.Yreg.toString(16);
            row.cells.item(6).innerHTML = _CPU.Zflag.toString(16);
            row.cells.item(7).innerHTML = pState;
        }

        public static loadDiskTable(): void {
            var diskContainer: HTMLDivElement = <HTMLDivElement> document.getElementById("fsContainer");
            var diskTable: HTMLTableElement = <HTMLTableElement> document.createElement("table");
            diskTable.className = "tbFS";
            diskTable.id = "tbFS";
            diskTable.className = "tableStyle";
            var diskTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.createElement("tbody");
            var tsb:string;

            for (var i = 0; i < sessionStorage.length; i++){
                var row: HTMLTableRowElement = <HTMLTableRowElement> document.createElement("tr");
                tsb = sessionStorage.key(i).toString();
                var dataBlock = this.breakdownBlock(tsb);
                row.id = tsb;
                var cell: HTMLTableCellElement = <HTMLTableCellElement> document.createElement("td");

                var cellText = document.createTextNode(tsb.charAt(0) + ":" + tsb.charAt(1) + ":" +tsb.charAt(2));
                cell.appendChild(cellText);
                row.appendChild(cell);        

                cell = document.createElement("td");
                cellText = document.createTextNode(dataBlock.pop());
                cell.appendChild(cellText);
                row.appendChild(cell);  

                cell = document.createElement("td");
                cellText = document.createTextNode(dataBlock.pop());
                cell.appendChild(cellText);
                row.appendChild(cell); 

                cell = document.createElement("td");
                cellText = document.createTextNode(dataBlock.pop());
                cell.appendChild(cellText);
                row.appendChild(cell);            
                diskTableBody.appendChild(row);
            }
            diskTable.appendChild(diskTableBody);
            diskContainer.appendChild(diskTable);
        }

        public static updateDiskTable(tsb): void {
            var diskTable: HTMLTableElement = <HTMLTableElement> document.getElementById("tbFS");
            var dataBlock = this.breakdownBlock(tsb);            
            diskTable.rows.namedItem(tsb).cells[1].innerHTML = dataBlock.pop();             
            diskTable.rows.namedItem(tsb).cells[2].innerHTML = dataBlock.pop(); 
            diskTable.rows.namedItem(tsb).cells[3].innerHTML = dataBlock.pop();
         }

        public static breakdownBlock(tsb): string[]{
            var dataBlock = new Array<string>();
            var value: string[] = JSON.parse(sessionStorage.getItem(tsb));
            var dataBytes: string = value.splice(4,60).toString().replace(/,/g,"");
            dataBlock.push(dataBytes);
            var pointerByte: string = value.splice(1,3).toString().replace(/,/g,"");
            dataBlock.push(pointerByte);
            var firstByte: string = value.splice(0,1).toString();
            dataBlock.push(firstByte);
            return dataBlock;       
        }

        public static removeProcessTable(pid): void{
            //after program is complete, table is cleared
            var processTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.getElementById("processTbody");    
            
            if (pid == -1 ){
                while(processTableBody.hasChildNodes()){
                    processTableBody.removeChild(processTableBody.firstChild);
                }
            }
            else {
                var row: HTMLTableRowElement = <HTMLTableRowElement> document.getElementById("pid"+pid);
                row.parentNode.removeChild(row);  
            } 
        }

        //continuously runs when process is running
        public static updateCPU(): void {
            var cpuTable: HTMLTableElement = <HTMLTableElement> document.getElementById("taCPU");
            var pc = _CPU.PC.toString(16).toUpperCase();
            if(pc.length == 1){
                pc = "0" + pc;
            }
            //updates values in CPU table
            cpuTable.rows[1].cells.namedItem("cPC").innerHTML = pc;
            cpuTable.rows[1].cells.namedItem("cIR").innerHTML = _CPU.IR.toString();            
            cpuTable.rows[1].cells.namedItem("cACC").innerHTML = _CPU.Acc.toString(16);            
            cpuTable.rows[1].cells.namedItem("cX").innerHTML = _CPU.Xreg.toString(16);            
            cpuTable.rows[1].cells.namedItem("cY").innerHTML = _CPU.Yreg.toString(16);            
            cpuTable.rows[1].cells.namedItem("cZ").innerHTML = _CPU.Zflag.toString(16);                      
        } 

        public static msg : string;

        public static updateStatus(msg : string ) : void {
            // Update status
            this.msg = msg;
             // Update status bar
            var taStatus = <HTMLInputElement> document.getElementById("taStatus");
            taStatus.value = msg;
        }

        public static Time(msg: string, source: string = "?"): void {
            /*var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            var s = today.getSeconds();
            document.getElementById('taTime').innerHTML =
            h + ":" + m + ":" + s;*/

            var today = new Date();
            var h: number = today.getHours();
            var m: number = today.getMinutes();
            var s: number = today.getSeconds();

            //adds 0 in front of value if minute or second value is less than 10
            if (m < 10 && s > 10) {
                var str: string = h + ":0" + m + ":" + s;
                var taTime = <HTMLInputElement> document.getElementById("taTime");
                taTime.value = str;
            }
            else if (s < 10 && m > 10) {
                var str: string = h + ":" + m + ":0" + s;
                var taTime = <HTMLInputElement> document.getElementById("taTime");
                taTime.value = str;
            }
            else if (s > 10 && m > 10) {
                var str: string = h + ":" + m + ":" + s;
                var taTime = <HTMLInputElement> document.getElementById("taTime");
                taTime.value = str;
            }
            else if (s < 10 && m < 10){
                var str: string = h + ":0" + m + ":0" + s;
                var taTime = <HTMLInputElement> document.getElementById("taTime");
                taTime.value = str;
            };

            /* Get the time.
            var now: number = new Date();
              Build the log string.
            var str: date = now;
              Update the log console.
            var taTime = <HTMLInputElement> document.getElementById("taTime");
            taTime.value = str; */
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {


            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            //enables single step button
            (<HTMLButtonElement>document.getElementById("btnSingleStep")).disabled = false; 

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // ... Create and initialize the Memory
            _Memory = new Memory();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _Memory.init();

            //initialize memory accessor
            _MemoryAccessor = new MemoryAccessor();
            _MemoryAccessor.init();
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?

        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnSingle_click(btn): void {
            _SingleStep = !(_SingleStep); //if single step mode button is clicked
            if (_SingleStep){ //if its avtivated
                btn.style.backgroundColor = "lime";
                btn.style.color = "black";
                this.hostBtnNextStep_onOff(); //allow for one step to be done at a time
            }
            else { //disable next step button
                (<HTMLButtonElement>document.getElementById("btnNextStep")).disabled = true;
                btn.style.backgroundColor = "black";
                btn.style.color = "lime";
            }         
        }

        //does the next step in the program
        public static hostBtnNextStep_click(btn): void {
            if(_CPU.isExecuting){
                _CPU.cycle();
                Control.updateCPU();
                if (_CPU.IR!=="00"){
                    Control.updateProcessTable(_CpuScheduler.runningProcess.pid, _CpuScheduler.runningProcess.pState);
                }
                _CpuScheduler.checkSchedule(); 
            }
        }

        //turns single step mode on and off
        public static hostBtnNextStep_onOff(): void {
            if(_CPU.isExecuting){ //if there is a running program allow for next step button to work
                (<HTMLButtonElement>document.getElementById("btnNextStep")).disabled = false;
                document.getElementById("btnNextStep").style.backgroundColor = "lime";
                document.getElementById("btnNextStep").style.color = "black";        
            }
            else { //else disable the next step button
                (<HTMLButtonElement>document.getElementById("btnNextStep")).disabled = true;
                document.getElementById("btnNextStep").style.backgroundColor = "black";
                document.getElementById("btnNextStep").style.color = "lime";               
            }
        }
    }
}
