//RAM.ts
var TSOS;
(function (TSOS) {
    var RAM = /** @class */ (function () {
        function RAM() {
            // checks if RAM partition is loaded
            this.RAMP1 = false;
            this.RAMP2 = false;
            this.RAMP3 = false;
        }
        RAM.prototype.init = function () {
            // creates the RAM at boot
            this.RAM = new Array();
            for (var i = 0; i < 768; i++) {
                this.RAM.push("00");
            }
            // all partitions are available
            this.RAMP1 = false;
            this.RAMP2 = false;
            this.RAMP3 = false;
            // load table on user interface
            this.loadTable();
        };
        RAM.prototype.loadTable = function () {
            // load RAM table at start up
            var RAMContainer = document.getElementById("RAMContainer");
            var RAMTable = document.createElement("table");
            RAMTable.className = "taRAM";
            RAMTable.id = "taRAM";
            var RAMTableBody = document.createElement("tbody");
            // creating cells for "bytes"
            for (var i = 0; i < 96; i++) {
                // create rows
                var row = document.createElement("tr");
                row.id = "RAMRow-" + (8 * i);
                var cell = document.createElement("td");
                // row label
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
                    var RAMValue = this.RAM[index];
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
        };
        RAM.prototype.updateTable = function (baseReg) {
            // update RAM table after new process is loaded
            var RAMTable = document.getElementById("taRAM");
            var rowId;
            var index;
            var cellId;
            var limitReg = baseReg + 256;
            for (var i = baseReg; i < limitReg / 8; i++) {
                rowId = "RAMRow-" + (8 * i);
                for (var j = 0; j < 8; j++) {
                    index = j + (8 * i);
                    var id = "000" + index.toString(16).toUpperCase();
                    cellId = id.slice(-4);
                    RAMTable.rows.namedItem(rowId).cells.namedItem(cellId).innerHTML = this.RAM[index];
                }
            }
        };
        return RAM;
    }());
    TSOS.RAM = RAM;
})(TSOS || (TSOS = {}));
