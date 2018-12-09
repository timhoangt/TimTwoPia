///<reference path="../globals.ts" />
///<reference path="queue.ts" />
///<reference path="pcb.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = /** @class */ (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Use time.
            TSOS.Control.Time("bootstrap", "time");
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _ResidentQueue = new TSOS.Queue();
            _ReadyQueue = new TSOS.Queue();
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            _MemoryManager = new TSOS.MemoryManager();
            _CpuScheduler = new TSOS.CpuScheduler();
            //
            // ... more?
            //
            this.krnTrace("Loading the file system device driver");
            _krnFileSystemDriver = new TSOS.DeviceDriverFileSystem();
            _krnFileSystemDriver.driverEntry();
            this.krnTrace(_krnFileSystemDriver.status);
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            _CPU.isExecuting = false;
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                if (!_SingleStep) {
                    _CPU.cycle();
                    TSOS.Control.updateCPU();
                    if (_CPU.IR !== "00") {
                        TSOS.Control.updateProcessTable(_CpuScheduler.runningProcess.pid, _CpuScheduler.runningProcess.pState);
                    }
                    _CpuScheduler.checkSchedule();
                }
                else {
                    TSOS.Control.hostBtnNextStep_onOff();
                }
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case PROGRAMERROR_IRQ:
                    this.programError(params);
                    break;
                case PRINT_IRQ:
                    this.print(params);
                    break;
                case CONTEXT_SWITCH_IRQ:
                    this.contextSwitch(params);
                    break;
                case KILL_IRQ:
                    this.killProcess(params);
                    break;
                case ACCESS_IRQ:
                    this.memoryAccessError(params);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.print = function (chr) {
            _StdOut.putText(chr);
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };
        Kernel.prototype.programError = function (opCode) {
            // When user program entry is not a valid op ocde
            _StdOut.putText("Error. Op code " + opCode + " does not exist.");
            _StdOut.nextLine();
            _OsShell.putPrompt();
        };
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        Kernel.prototype.krnCreateProcess = function (pBase) {
            _PID++;
            var pid = _PID;
            var process = new TSOS.PCB(pBase, pid, "Resident", 1);
            //status of program to ready
            _ResidentQueue.enqueue(process);
            //updates process table
            TSOS.Control.addProcessTable(process);
            return pid;
        };
        Kernel.prototype.krnExecuteProcess = function (pid) {
            var process;
            var switched = false;
            var pidExists = false;
            //all the pids in the resident queue exist
            for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                process = _ResidentQueue.dequeue();
                if (process.pid == pid) {
                    pidExists = true;
                    break;
                }
                _ResidentQueue.enqueue(process);
                switched = !switched;
            }
            if (pidExists) { //run the process if it exists
                if (switched) {
                    _ResidentQueue.enqueue(_ResidentQueue.dequeue());
                }
                process.pState = "Ready"; //the program is now ready and active
                _CpuScheduler.activePIDList.push(process.pid);
                _ReadyQueue.enqueue(process);
                TSOS.Control.updateProcessTable(process.pid, process.pState);
                _CpuScheduler.start();
            }
            else { //if the process doesnt exist
                _StdOut.putText("No process with id: " + pid);
                _StdOut.nextLine();
            }
        };
        Kernel.prototype.krnExecuteAllProcess = function () {
            var process;
            while (!_ResidentQueue.isEmpty()) {
                process = _ResidentQueue.dequeue();
                _CpuScheduler.activePIDList.push(process.pid);
                process.pState = "Ready";
                _ReadyQueue.enqueue(process);
                TSOS.Control.updateProcessTable(process.pid, process.pState);
            }
            _CpuScheduler.start();
        };
        // - ExitProcess
        Kernel.prototype.krnExitProcess = function (process) {
            process.waitTime = _CpuScheduler.totalCycles - process.turnaroundTime;
            process.turnaroundTime = process.turnaroundTime + process.waitTime;
            _StdOut.nextLine();
            _StdOut.putText("Process id " + process.pid + " finished.");
            _StdOut.nextLine();
            _StdOut.putText("The turnaround time was " + process.turnaroundTime + " ticks.");
            _StdOut.nextLine();
            _StdOut.putText("The wait time was " + process.waitTime + " ticks.");
            _StdOut.nextLine();
            _OsShell.putPrompt();
            _MemoryManager.clearPartition(process.pBase); //clears program from memory
            TSOS.Control.removeProcessTable(process.pid); //removes program from processs table
            var index = _CpuScheduler.activePIDList.indexOf(process.pid); //removes from active list
            _CpuScheduler.activePIDList.splice(index, 1);
            if (_CpuScheduler.activePIDList.length == 0) {
                _CpuScheduler.checkSchedule();
            }
            else {
                _CpuScheduler.currCycle = _CpuScheduler.quantum;
            }
        };
        // - WaitForProcessToExit
        // - CreateFile
        Kernel.prototype.krnCreateFile = function (filename) {
            var returnMsg = _krnFileSystemDriver.createFile(filename);
            _StdOut.putText(returnMsg);
        };
        // - OpenFile
        // - ReadFile
        Kernel.prototype.krnReadFile = function (filename) {
            var returnMsg = _krnFileSystemDriver.readFile(filename);
            _StdOut.putText(returnMsg);
        };
        // - WriteFile
        Kernel.prototype.krnWriteFile = function (filename, fileContent) {
            var returnMsg = _krnFileSystemDriver.writeFile(filename, fileContent);
            _StdOut.putText(returnMsg);
        };
        Kernel.prototype.krnDeleteFile = function (filename) {
        };
        // - CloseFile
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                        TSOS.Control.Time(msg, "");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                    TSOS.Control.Time(msg, "");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _KernelError = true;
            // Start BSOD function.
            _Console.BSOD(msg);
            this.krnShutdown();
        };
        Kernel.prototype.contextSwitch = function (runningProcess) {
            if (_CPU.IR != "00") { //puts process in process control block
                var currProcess = new TSOS.PCB(runningProcess.pBase, runningProcess.pid, "Ready", 1);
                currProcess.pCounter = _CPU.PC;
                currProcess.pAcc = _CPU.Acc;
                currProcess.pXreg = _CPU.Xreg;
                currProcess.pYreg = _CPU.Yreg;
                currProcess.pZflag = _CPU.Zflag;
                currProcess.turnaroundTime = runningProcess.turnaroundTime;
                _ReadyQueue.enqueue(currProcess);
                TSOS.Control.updateProcessTable(currProcess.pid, currProcess.pState);
            }
            var nextProcess = _ReadyQueue.dequeue(); //next program is being executed in CPU
            _CPU.PC = nextProcess.pCounter;
            _CPU.Acc = nextProcess.pAcc;
            _CPU.Xreg = nextProcess.pXreg;
            _CPU.Yreg = nextProcess.pYreg;
            _CPU.Zflag = nextProcess.pZflag;
            nextProcess.pState = "Running";
            _CpuScheduler.runningProcess = nextProcess;
            this.krnTrace(_CpuScheduler.schedule + ": switching to Process id: " + nextProcess.pid);
            _CpuScheduler.currCycle = 0;
        };
        //kills process
        Kernel.prototype.killProcess = function (pid) {
            var process;
            var index = _CpuScheduler.activePIDList.indexOf(parseInt(pid));
            if (index == -1) { //if it doesnt exist
                _StdOut.putText("No process " + pid + " is active");
                _StdOut.nextLine();
                _OsShell.putPrompt();
            }
            else {
                if (pid == _CpuScheduler.runningProcess.pid) { //if its running
                    this.krnExitProcess(_CpuScheduler.runningProcess); //end the program
                }
                else { //if it exists but isnt running
                    for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                        process = _ReadyQueue.dequeue();
                        if (process.pid == pid) {
                            this.krnExitProcess(process);
                            break;
                        }
                        else {
                            _ReadyQueue.enqueue(process);
                        }
                    }
                }
            }
        };
        Kernel.prototype.memoryAccessError = function (pid) {
            _StdOut.putText("Memory access error from process " + pid);
            this.krnExitProcess(_CpuScheduler.runningProcess);
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
