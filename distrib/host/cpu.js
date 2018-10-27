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
        function Cpu(PC, IR, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = "00"; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        //initializes all values we need for CPU
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.IR = "00";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            var process;
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.PC == 0) {
                //starts runnning process
                process = _ReadyQueue.dequeue();
                process.pState = "Running";
                _ReadyQueue.enqueue(process);
                TSOS.Control.updateProcessTable(process.pid, this.PC, this.IR, this.Acc, this.Xreg, this.Yreg, this.Zflag);
            }
            //matches opCode with instruction
            var opCode = this.fetch(this.PC);
            this.IR = opCode;
            //calls upon execution function
            this.decodeExecute(this.IR);
            //calls upon an update to the CPU and process tables
            TSOS.Control.updateCPU(this);
            if (this.isExecuting) {
                TSOS.Control.updateProcessTable(process.pid, this.PC, this.IR, this.Acc, this.Xreg, this.Yreg, this.Zflag);
            }
        };
        Cpu.prototype.fetch = function (PC) {
            return _MemoryAccessor.readMemory(PC);
        };
        //Executes op codes
        Cpu.prototype.decodeExecute = function (opCode) {
            if (opCode.length > 0) {
                var data;
                var addr;
                var index;
                switch (opCode) {
                    //Load the accumulator with a constant
                    case "A9":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Acc = data;
                        this.PC += 2;
                        break;
                    //Load the accumulator from memory
                    case "AD":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data;
                        this.PC += 3;
                        break;
                    //Store the accumulator in memory
                    case "8D":
                        data = this.Acc;
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        _MemoryAccessor.writeMemory(addr, data);
                        this.PC += 3;
                        break;
                    //Add with carry
                    case "6D":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Acc = data + this.Acc;
                        this.PC += 3;
                        break;
                    //Load the X register with a constant
                    case "A2":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Xreg = data;
                        this.PC += 2;
                        break;
                    //Load the X register from memory
                    case "AE":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Xreg = data;
                        this.PC += 3;
                        break;
                    //Load the Y register with a constant
                    case "A0":
                        data = parseInt(this.fetch(this.PC + 1), 16);
                        this.Yreg = data;
                        this.PC += 2;
                        break;
                    //Load the Y register from memory
                    case "AC":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        this.Yreg = data;
                        this.PC += 3;
                        break;
                    //no operation
                    case "EA":
                        this.PC++;
                        break;
                    //Break (which is really a system call) 
                    case "00":
                        _Kernel.krnExitProcess();
                        this.init();
                        TSOS.Control.updateCPU(this);
                        break;
                    //Compare a byte in memory to the X reg 
                    case "EC":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        if (data == this.Xreg) {
                            this.Zflag = 1;
                        }
                        else {
                            this.Zflag = 0;
                        }
                        this.PC += 3;
                        break;
                    //Branch n bytes if Z flag = 0
                    case "D0":
                        if (this.Zflag == 0) {
                            var branch = parseInt(this.fetch(this.PC + 1), 16) + this.PC;
                            if (branch < 256) {
                                this.PC = branch + 2;
                            }
                            else {
                                branch = branch % 256;
                                this.PC = branch + 2;
                            }
                        }
                        else {
                            this.PC += 2;
                        }
                        break;
                    //Increment the value of a byte 
                    case "EE":
                        addr = this.fetch(this.PC + 2) + this.fetch(this.PC + 1);
                        index = parseInt(addr, 16);
                        data = parseInt(this.fetch(index), 16);
                        data++;
                        _MemoryAccessor.writeMemory(addr, data);
                        this.PC += 3;
                        break;
                    //System Call
                    case "FF":
                        var str = "";
                        if (this.Xreg == 1) {
                            str = this.Yreg.toString();
                        }
                        else if (this.Xreg == 2) {
                            addr = this.Yreg.toString(16);
                            index = parseInt(addr, 16);
                            data = parseInt(this.fetch(index), 16);
                            var chr = String.fromCharCode(data);
                            while (data != 0) {
                                str = str + chr;
                                index++;
                                data = parseInt(this.fetch(index), 16);
                                chr = String.fromCharCode(data);
                            }
                        }
                        //prints through kernel
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_IRQ, str));
                        this.PC++;
                        break;
                    default:
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROGRAMERROR_IRQ, opCode));
                        _Kernel.krnExitProcess();
                        this.init();
                        //updates CPU table
                        TSOS.Control.updateCPU(this);
                        break;
                }
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
