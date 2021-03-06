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

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Use time.
            Control.Time("bootstrap", "time");
            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _ResidentQueue = new Queue();
            _ReadyQueue = new Queue();

            // Initialize the console.
            _Console = new Console();          // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            _MemoryManager = new MemoryManager();
            _CpuScheduler = new CpuScheduler();

            //
            // ... more?
            //
            this.krnTrace("Loading the file system device driver");
            _krnFileSystemDriver = new DeviceDriverFileSystem();
            _krnFileSystemDriver.driverEntry();
            this.krnTrace(_krnFileSystemDriver.status);

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            //initialize swapper
            _Swapper = new Swapper();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
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
        }


        public krnOnCPUClockPulse() {
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
                if(!_SingleStep){
                    _CPU.cycle();
                    Control.updateCPU();
                    if (_CPU.IR!=="00"){
                        Control.updateProcessTable(_CpuScheduler.runningProcess.pid, _CpuScheduler.runningProcess.pState, "Memory");
                    }
                    _CpuScheduler.checkSchedule();    
                }
                else {
                    Control.hostBtnNextStep_onOff();
                }
            }
            else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
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
        }

        public print(chr){
            _StdOut.putText(chr);
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }
        public programError(opCode){
            // When user program entry is not a valid op ocde
            _StdOut.putText("Error. Op code " + opCode + " does not exist.");
            _StdOut.nextLine();
            _OsShell.putPrompt();
        }
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        public krnCreateProcess(pBase, priority, tsb) {
            _PID++;
            var pid = _PID;            
            var process = new PCB(pBase, pid, "Resident", priority, tsb);
            if(tsb!=null){
                process.pLocation = "Disk";
            }
            //status of program to ready
            _ResidentQueue.enqueue(process);
            //updates process table
            Control.addProcessTable(process);
            return pid;
        }

        public krnExecuteProcess(pid){
            var process;
            var switched:boolean = false;
            var pidExists:boolean = false;
            //all the pids in the resident queue exist
            for (var i=0; i<_ResidentQueue.getSize(); i++){
                process = _ResidentQueue.dequeue();
                if (process.pid == pid){
                    pidExists = true;
                    break;
                }
                _ResidentQueue.enqueue(process);
                switched = !switched;
            }
            if (pidExists){ //run the process if it exists
                if (switched){
                    _ResidentQueue.enqueue(_ResidentQueue.dequeue());
                }
                process.pState = "Ready"; //the program is now ready and active
                _CpuScheduler.activePIDList.push(process.pid);  
                _ReadyQueue.enqueue(process);
                Control.updateProcessTable(process.pid, process.pState, process.pLocation);
                _CpuScheduler.start();
            }
            else { //if the process doesnt exist
                _StdOut.putText("No process with id: " + pid); 
                _StdOut.nextLine();
            }
        }

        public krnExecuteAllProcess(){ //run all processes
            var process; 
            while (!_ResidentQueue.isEmpty()){
                process = _ResidentQueue.dequeue();
                _CpuScheduler.activePIDList.push(process.pid);
                process.pState = "Ready";
                _ReadyQueue.enqueue(process);
                Control.updateProcessTable(process.pid, process.pState, process.pLocation);
            }
            _CpuScheduler.start();
        }

        // - ExitProcess
        public krnExitProcess(process){
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
            Control.removeProcessTable(process.pid); //removes program from processs table
            var index = _CpuScheduler.activePIDList.indexOf(process.pid); //removes from active list
            _CpuScheduler.activePIDList.splice(index, 1); 
            if ( _CpuScheduler.activePIDList.length == 0){
                _CpuScheduler.checkSchedule();
            }
            else {
                _CpuScheduler.currCycle = _CpuScheduler.quantum;
            }
        }
        // - WaitForProcessToExit
        // - CreateFile
        public krnCreateFile(filename){
            var returnMsg:string = _krnFileSystemDriver.createFile(filename);
            _StdOut.putText(returnMsg);
        }
        // - OpenFile
        // - ReadFile
        public krnReadFile(filename){
            var returnMsg = _krnFileSystemDriver.readFile(filename);
            _StdOut.putText(returnMsg);
        }
        // - WriteFile
        public krnWriteFile(filename, fileContent){
            var returnMsg = _krnFileSystemDriver.writeFile(filename, fileContent);
            _StdOut.putText(returnMsg);
        }

        public krnDeleteFile(filename){
            var returnMsg = _krnFileSystemDriver.deleteFile(filename);
            _StdOut.putText(returnMsg);
        }
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                        Control.Time(msg, "");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                    Control.Time(msg,"");
                }

             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _KernelError = true;
             // Start BSOD function.
            _Console.BSOD(msg);
            this.krnShutdown();
        }

        public contextSwitch(runningProcess){
            if (_CPU.IR != "00"){ //puts process in process control block
                var currProcess;
                var nextProcess;
                currProcess = new PCB(runningProcess.pBase, runningProcess.pid, "Ready", 1, null);
                currProcess.pCounter = _CPU.PC;
                currProcess.pAcc = _CPU.Acc;
                currProcess.pXreg = _CPU.Xreg;
                currProcess.pYreg = _CPU.Yreg;
                currProcess.pZflag = _CPU.Zflag;
                currProcess.turnaroundTime = runningProcess.turnaroundTime;
                _ReadyQueue.enqueue(currProcess);
                Control.updateProcessTable(currProcess.pid, currProcess.pState, "Memory");
            }
            nextProcess = _ReadyQueue.dequeue(); //next program is being executed in CPU
            if (nextProcess.pBase == 999){
                var newTSB: string = _Swapper.swapProcess(nextProcess.tsb, runningProcess.pBase, runningProcess.pLimit);
                if (newTSB){
                    nextProcess.pBase = runningProcess.pBase;
                    if(currProcess){
                        var prevProcess = _ReadyQueue.dequeue();
                        while(prevProcess.pid!=currProcess.pid){
                            _ReadyQueue.enqueue(prevProcess);
                            prevProcess = _ReadyQueue.dequeue();
                        }
                        prevProcess.tsb = newTSB;
                        prevProcess.pBase = 999;
                        _ReadyQueue.enqueue(prevProcess);
                    }
                }
                else{
                    var error = "Disk and memory are full."
                    _KernelInterruptQueue.enqueue(new Interrupt(PROGRAMERROR_IRQ, error));
                    _Kernel.krnExitProcess(_CpuScheduler.runningProcess);
                    _CPU.init();
                }
            }
            _CPU.PC = nextProcess.pCounter;
            _CPU.Acc = nextProcess.pAcc;
            _CPU.Xreg = nextProcess.pXreg;
            _CPU.Yreg = nextProcess.pYreg;
            _CPU.Zflag = nextProcess.pZflag;
            nextProcess.pState = "Running";
            _CpuScheduler.runningProcess = nextProcess; 
            this.krnTrace(_CpuScheduler.schedule + ": switching to Process id: " + nextProcess.pid);
            _CpuScheduler.currCycle = 0;
        }

        //kills process
        public killProcess(pid){
            var process;
            var index = _CpuScheduler.activePIDList.indexOf(parseInt(pid));
             if (index == -1){ //if it doesnt exist
                _StdOut.putText("No process " + pid + " is active");
                _StdOut.nextLine();
                _OsShell.putPrompt();
            }
            else {
                if (pid == _CpuScheduler.runningProcess.pid){ //if its running
                    this.krnExitProcess(_CpuScheduler.runningProcess); //end the program
                }
                else { //if it exists but isnt running
                    for (var i=0; i<_ReadyQueue.getSize(); i++){
                        process = _ReadyQueue.dequeue();
                        if (process.pid == pid){
                            this.krnExitProcess(process);
                            break;
                        }
                        else {
                            _ReadyQueue.enqueue(process);
                        }
                    }
                }
            }
        }

        public memoryAccessError(pid){ //not enough memory for the process
            _StdOut.putText("Memory access error from process " + pid);
            this.krnExitProcess(_CpuScheduler.runningProcess);
        }

        public krnWriteProcess(inputOpCodes): string{ //goes to filesystemdriver to write the process with the opcodes
            var tsb:string = _krnFileSystemDriver.writeProcess(inputOpCodes);
            return tsb;
        }

    }
}
