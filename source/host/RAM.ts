//RAM.ts
module TSOS {
        
            export class RAM {
                
                // array of bytes as RAM
                public RAM: string[];

                // checks if RAM partition is loaded
                public RAMP1: boolean = false;
                public RAMP2: boolean = false;
                public RAMP3: boolean = false;

                public init(): void {
                    // creates the RAM at boot
                    this.RAM = new Array<string>();
                    for (var i = 0; i<768; i++){
                        this.RAM.push("00");
                    }

                    // all partitions are available
                    this.RAMP1 = false;
                    this.RAMP2 = false;
                    this.RAMP3 = false;

                    // load table on user interface
                    this.loadTable();
                }

                public loadTable(): void {
                    // load RAM table at start up
                    var RAMContainer: HTMLDivElement = <HTMLDivElement> document.getElementById("RAMContainer");
                    var RAMTable: HTMLTableElement = <HTMLTableElement> document.createElement("table");
                    RAMTable.className = "taRAM";
                    RAMTable.id = "taRAM";
                    var RAMTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.createElement("tbody");
                    
                    // creating cells for "bytes"
                    for (var i = 0; i < 96; i++){
                        // create rows
                        var row: HTMLTableRowElement = <HTMLTableRowElement> document.createElement("tr");
                        row.id = "RAMRow-" + (8*i);
                        var cell: HTMLTableCellElement = <HTMLTableCellElement> document.createElement("td");

                        // row label
                        var val: number = 8*i;
                        var hexVal: string = "000" + val.toString(16).toUpperCase();
                        var cellText = document.createTextNode(hexVal.slice(-4));
                        cell.id = "byte" + hexVal.slice(-4);
                        cell.appendChild(cellText);
                        row.appendChild(cell);        

                        for (var j = 0; j < 8; j++) {
                            cell = document.createElement("td");
                            var index: number = j + (8 * i);
                            var id: string = "000" + index.toString(16).toUpperCase();
                            var RAMValue: string = this.RAM[index];
                            cellText = document.createTextNode(RAMValue);
                            cell.id = id.slice(-4);
                            cell.appendChild(cellText);
                            row.appendChild(cell);
                        }
                        RAMTableBody.appendChild(row);

                        // for debugging
                        console.log(RAMTable);
                    }
                    
                    RAMTable.appendChild(RAMTableBody);
                    RAMContainer.appendChild(RAMTable);
                }

                public updateTable(baseReg): void {
                   
                    // update RAM table after new process is loaded
                    var RAMTable: HTMLTableElement = <HTMLTableElement> document.getElementById("taRAM");
                    var rowId: string;
                    var index: number;                    
                    var cellId: string;
                    var limitReg: number = baseReg + 256;
                    for (var i = baseReg; i < limitReg/8 ; i++){
                        rowId = "RAMRow-" + (8*i);
                        for (var j = 0; j < 8; j ++){
                            index = j + (8 * i);
                            var id: string = "000" + index.toString(16).toUpperCase();                            
                            cellId = id.slice(-4);                            
                            RAMTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = this.RAM[index];
                        }
                    }
                }

            }
        }