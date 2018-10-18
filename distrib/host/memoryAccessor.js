///<reference path="../globals.ts" />
/* ------------
    MEMORYACCESSOR.ts
    Requires global.ts.
    ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        }
        MemoryAccessor.prototype.init = function () {
            this.memoryP1 = false;
            this.memoryP2 = false;
            this.memoryP3 = false;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
