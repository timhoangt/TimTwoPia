///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.updateCPU = function () {
            var cpuTable = document.getElementById("taCPU");
            cpuTable.rows[1].cells.namedItem("cPC").innerHTML = this.PC.toString();
            cpuTable.rows[1].cells.namedItem("cIR").innerHTML = this.PC.toString();
            cpuTable.rows[1].cells.namedItem("cACC").innerHTML = this.Acc.toString();
            cpuTable.rows[1].cells.namedItem("cX").innerHTML = this.Xreg.toString();
            cpuTable.rows[1].cells.namedItem("cY").innerHTML = this.Yreg.toString();
            cpuTable.rows[1].cells.namedItem("cZ").innerHTML = this.Zflag.toString();
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            if (this.PC == 0) {
                _PCB = _ReadyQueue.dequeue();
                _PCB.pState = "Running";
                this.PC = _PCB.pBase;
            }
            var opCode = this.fetch(this.PC);
            this.decodeExecute(opCode);
            this.updateCPU();
        };
        Cpu.prototype.fetch = function (PC) {
            return _Memory.memory[PC];
        };
        Cpu.prototype.decodeExecute = function (opCode) {
            if (opCode.length > 0) {
                var data;
                var addr;
                switch (opCode) {
                    case "A9":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Acc = data;
                        this.PC += 2;
                        break;
                    case "AD":
                        addr = this.fetch(this.PC + 1);
                        addr = this.fetch(this.PC + 2) + addr;
                        var index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data;
                        this.PC += 3;
                        break;
                    case "8D":
                        data = this.Acc;
                        addr = this.fetch(this.PC + 1);
                        addr = this.fetch(this.PC + 2) + addr;
                        _MemoryManager.updateMemory(addr, data);
                        this.PC += 3;
                        break;
                    case "6D":
                        addr = this.fetch(this.PC + 1);
                        addr = this.fetch(this.PC + 2) + addr;
                        var index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data + this.Acc;
                        this.PC += 3;
                        break;
                    case "A2":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Xreg = data;
                        this.PC += 2;
                        break;
                    case "AE":
                        addr = this.fetch(this.PC + 1);
                        addr = this.fetch(this.PC + 2) + addr;
                        var index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index));
                        this.Xreg = data;
                        this.PC += 3;
                        break;
                    case "A0":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Yreg = data;
                        this.PC += 2;
                        break;
                    case "AC":
                        addr = this.fetch(this.PC + 1);
                        addr = this.fetch(this.PC + 2) + addr;
                        var index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index));
                        this.Yreg = data;
                        this.PC += 3;
                        break;
                    case "EA":
                        this.PC++;
                        break;
                    case "00":
                        _Kernel.krnExitProcess();
                        this.init();
                        this.updateCPU();
                        break;
                    case "EC":
                        addr = this.fetch(this.PC + 1);
                        addr = this.fetch(this.PC + 2) + addr;
                        var index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        if (data == this.Xreg) {
                            this.Zflag = 1;
                        }
                        else {
                            this.Zflag = 0;
                        }
                        this.PC += 3;
                        break;
                    case "D0":
                        if (this.Zflag == 0) {
                            var branch = parseInt(this.fetch(this.PC + 1), 16) + this.PC;
                            if (branch < _PCB.pLimit) {
                                this.PC = branch;
                            }
                            else {
                                branch = branch % 256;
                                this.PC = branch;
                            }
                            this.PC += 2;
                        }
                        else {
                            this.PC += 2;
                        }
                        break;
                    case "EE":
                        addr = this.fetch(this.PC + 1);
                        addr = this.fetch(this.PC + 2) + addr;
                        var index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        data++;
                        _MemoryManager.updateMemory(addr, data);
                        this.PC += 3;
                        break;
                    case "FF":
                        var str = "";
                        if (this.Xreg == 1) {
                            str = this.Yreg.toString();
                        }
                        else if (this.Xreg == 2) {
                            addr = this.Yreg.toString(16);
                            var index = parseInt(addr, 16);
                            data = parseInt(this.fetch(index), 16);
                            var chr = String.fromCharCode(data);
                            while (data != 0) {
                                str = str + chr;
                                index++;
                                data = parseInt(this.fetch(index), 16);
                                chr = String.fromCharCode(data);
                            }
                        }
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_IRQ, str));
                        this.PC++;
                        break;
                    default:
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROGRAMERROR_IRQ, opCode));
                        _Kernel.krnExitProcess();
                        this.init();
                        this.updateCPU();
                        break;
                }
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
