///<reference path="../globals.ts" />
/* ------------
MEMORY.ts
 Requires global.ts.
------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
        Memory.prototype.init = function () {
            this.memory = new Array();
            for (var i = 0; i < 768; i++) {
                this.memory.push("00");
            }
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
            this.loadTable();
        };
        Memory.prototype.loadTable = function () {
            var memoryContainer = document.getElementById("memoryContainer");
            var memoryTable = document.createElement("table");
            memoryTable.className = "taMemory";
            memoryTable.id = "taMemory";
            var memoryTableBody = document.createElement("tbody");
            // creating cells
            for (var i = 0; i < 96; i++) {
                // create rows
                var row = document.createElement("tr");
                row.id = "memoryRow-" + (8 * i);
                var cell = document.createElement("td");
                var val = 8 * i;
                var hexVal = "000" + val.toString(16).toUpperCase();
                var cellText = document.createTextNode(hexVal.slice(-4));
                cell.id = "byte" + hexVal.slice(-4);
                cell.appendChild(cellText);
                row.appendChild(cell);
                for (var j = 0; j < 8; j++) {
                    cell = document.createElement("td");
                    var index = j + (8 * i);
                    var id = "000" + index.toString(16).toUpperCase();
                    var memoryValue = this.memory[index];
                    cellText = document.createTextNode(memoryValue);
                    cell.id = id.slice(-4);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }
                memoryTableBody.appendChild(row);
            }
            memoryTable.appendChild(memoryTableBody);
            memoryContainer.appendChild(memoryTable);
        };
        Memory.prototype.updateTable = function (baseReg) {
            var memoryTable = document.getElementById("taMemory");
            var rowId;
            var index;
            var cellId;
            var limitReg = baseReg + 256;
            for (var i = baseReg; i < limitReg / 8; i++) {
                rowId = "memoryRow-" + (8 * i);
                for (var j = 0; j < 8; j++) {
                    index = j + (8 * i);
                    var id = "000" + index.toString(16).toUpperCase();
                    cellId = id.slice(-4);
                    memoryTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = this.memory[index];
                }
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
