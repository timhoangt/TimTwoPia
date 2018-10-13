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
      this.loadTable();
    }

    public loadTable(): void {
      var memoryContainer: HTMLDivElement = <HTMLDivElement> document.getElementById("memoryContainer");
      var memoryTable: HTMLTableElement = <HTMLTableElement> document.createElement("table");
      memoryTable.className = "taMemory";
      memoryTable.id = "taMemory";
      var memoryTableBody: HTMLTableSectionElement = <HTMLTableSectionElement> document.createElement("tbody");
      
      // creating cells
      for (var i = 0; i < 96; i++){
          // create rows
          var row: HTMLTableRowElement = <HTMLTableRowElement> document.createElement("tr");
          row.id = "memoryRow-" + (8*i);
          var cell: HTMLTableCellElement = <HTMLTableCellElement> document.createElement("td");
          var cellText = document.createTextNode("0x" + (8*i));
          cell.id = "byte" + (8*i);
          cell.appendChild(cellText);
          row.appendChild(cell);                        
          for (var j = 0; j < 8; j++) {
              cell = document.createElement("td");
              var index: number = j + (8 * i);
              var memoryValue: string = this.memory[index];
              cellText = document.createTextNode(memoryValue);
              cell.id = "memoryCell-" + index;
              cell.appendChild(cellText);
              row.appendChild(cell);
          }
      
          memoryTableBody.appendChild(row);
      }
      
      memoryTable.appendChild(memoryTableBody);
      memoryContainer.appendChild(memoryTable);
    }

    public updateTable(baseReg): void {
      var memoryTable: HTMLTableElement = <HTMLTableElement> document.getElementById("taMemory");
      var rowId: string;
      var index: number;                    
      var cellId: string;
      var limitReg: number = baseReg + 256;
      for (var i = baseReg; i < limitReg/8 ; i++){
          rowId = "memoryRow-" + (8*i);
          for (var j = 0; j < 8; j ++){
              index = j + (8 * i);
              cellId = "memoryCell-" + index;
              memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = this.memory[index];
          }
      }
    }
    
  }
}