///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellVer,
                                  "v");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellVer,
                                  "version");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                                  "whereami",
                                  "- Displays the current location.");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Updates the status on the console.");
            this.commandList[this.commandList.length] = sc;

            // error
            sc = new ShellCommand(this.shellError,
                                  "error",
                                  "<string> - Triggers an error for testing BSOD.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "<hex digit(s)> - Loads and validates user code.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "- <pid> - Runs the process according to their pID.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearmem,
                "clearmem",
                "- Wipes the memory clean.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunall,
                "runall",
                "- Runs all of the loaded processes.");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "- <int> - Changes the Round Robin quantum.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            sc = new ShellCommand(this.shellPs,
                "ps",
                "Lists the running processes and their IDs.");
            this.commandList[this.commandList.length] = sc;

            // kill <id> - kills the specified process id.
            sc = new ShellCommand(this.shellKill,
                "kill",
                "<pid> - Kills the specified process id.");
            this.commandList[this.commandList.length] = sc;

            // create <string>
            sc = new ShellCommand(this.shellCreate,
                "create",
                "<string> - Creates a file with the specified name.");
            this.commandList[this.commandList.length] = sc;
        
            // write <string> "string"
            sc = new ShellCommand(this.shellWrite,
                "write",
                "<string> \"string\" - Writes data within \"\" to file.");
            this.commandList[this.commandList.length] = sc;
             // read <filename>
            sc = new ShellCommand(this.shellRead,
                "read",
                "<string> - Reads content of specified file.");
            this.commandList[this.commandList.length] = sc;
             // delete <filename>
            sc = new ShellCommand(this.shellDelete,
                "delete",
                "<string> - Deletes specified file.");
            this.commandList[this.commandList.length] = sc;
             // ls
            sc = new ShellCommand(this.shellLs,
                "ls",
                "Lists all files on disk.");
            this.commandList[this.commandList.length] = sc;
            
            // format
            sc = new ShellCommand(this.shellFormat,
                "format",
                "Formats drive.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                "getschedule",
                "Shows the current CPU scheduling method.");
            this.commandList[this.commandList.length] = sc;

             // setschedule <string>
            sc = new ShellCommand(this.shellSetSchedule,
                "setschedule",
                "<string> - Changes the current CPU scheduling method. (rr, fcfs, priority)");
            this.commandList[this.commandList.length] = sc;

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.nextLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.nextLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. Here are some suggestions: ");
            var match : boolean = false;
            var sc : ShellCommand = null;
            var buffer = "";
            for (var i = 0; (i < _OsShell.commandList.length) && !match; i++) //this checks the commands
            {
               sc = _OsShell.commandList[i];
               if ( sc.command.search(buffer) == 0)
                {
                    match = true;
                }
            }
            if (match) //when match is true, replace the text
            {
                _StdOut.putText(sc.command.substr(buffer.length));
            }
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.nextLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.nextLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.nextLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.nextLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully not) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "ver":
                        _StdOut.putText("Ver displays the current version of the operating system you are using.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown turns off the virtual OS.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls resets the screen and cursor position.");
                        break;
                    // run <pid>
                    case "run":
                    _StdOut.putText("Runs the process with pID <pID>.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Wipes memory clean.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs all of the loaded processes.");
                        break;
                    case "quantum":
                        _StdOut.putText("Changes the Round Robin quantum to <int>.");
                        break;
                    case "ps":
                        _StdOut.putText("Ps displays a list of current processes and their IDs.");
                        break;
                    case "kill":
                        _StdOut.putText("Kill followed by the process ID would kill that process.");
                        break;
                    case "create":
                        _StdOut.putText("Create followed by a string for filename would create a file with that name.");
                        break;
                    case "write":
                        _StdOut.putText("Write followed by a string for filename and another string in double quotes for file contents would write the contents to the file with that name.");
                        break;
                    case "read":
                        _StdOut.putText("Read followed by a string for filename would print the contents of the file with that name.");
                        break;
                    case "delete":
                        _StdOut.putText("Delete followed by a string for filename would delete the file with that name.");
                        break;
                    case "ls":
                        _StdOut.putText("Ls would list the files currently stored on the disk.");
                        break;
                    case "format":
                        _StdOut.putText("Format would quick format the disk, deleting just the pointers.");
                        break;
                    case "getschedule":
                        _StdOut.putText("Shows the current CPU scheduling method.");
                        break;
                    case "setschedule":
                        _StdOut.putText("Changes the current CPU scheduling method. (rr, fcfs, priority)");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellDate(args) {
            var date = new Date()
            var day = date.getDate()
            var month = date.getMonth() + 1
            var year = date.getFullYear()
            _StdOut.putText(day + "/" + month + "/" + year)
        }

        public shellWhereami(args) {
            var d = new Date(); // or whatever date you have
            var tzName = d.toLocaleString('en', {timeZoneName:'short'}).split(' ').pop();
            _StdOut.putText("You are in " + tzName);
        }

        public shellStatus(args){
            if( args.length > 0)
                Control.updateStatus(args.join(' '));
            else
                _StdOut.putText("Usage: status <string> - Please supply a string.");
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellError(args)
        {
            if( args.length > 0)
                _Kernel.krnTrapError(args.join(' '));
            else
                _StdOut.putText("Usage: error <string> - Please supply a string.");
        }

        public shellLoad(args)
        {
            var programInput : string = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
            programInput = programInput.replace(/(\r\n|\n|\r)/gm,""); 
            var input = /^[a-f\d\s]+$/i; //hex digit filter
            if (input.test(programInput)) { //test if text matches hex digit
                var inputOpCodes: string[] = programInput.split(" ");
                if (inputOpCodes.length > 256){
                    _StdOut.putText("Not enough memory for this program.");                    
                } 
                else {
                    var baseReg: number = _MemoryManager.loadMemory(inputOpCodes);
                    if (baseReg == 999){
                        var returnMsg: string = _Kernel.krnWriteProcess(inputOpCodes);
                        _StdOut.putText(returnMsg);                    
                    }
                    else {
                        var pid: number = _Kernel.krnCreateProcess(baseReg, null);
                        _StdOut.putText("pID " + pid + " is in resident Queue");
                    }
                }
            }
            else if(programInput == ""){
                _StdOut.putText("Please enter 6502a op codes in the input area below.");
            }
            else {
                _StdOut.putText("Please enter a hex digit."); //if it doesnt match
            }
        }

        public shellRun(args) {
            var input = /^\d*$/;
            if (input.test(args) && args != ""){
                if (_ResidentQueue.isEmpty()){
                    _StdOut.putText("Nothing is loaded in memory.");
                }
                //matches value to potential pID
                else {
                    _Kernel.krnExecuteProcess(args);
                } 
            }
            else {
                _StdOut.putText("Please enter a valid pID.");
            }  
        }

        public shellClearmem(args){
            if (_CPU.isExecuting){
                _StdOut.putText("Cannot clear memory. A process is currently running. Use kill command to terminate process.")
            }
            else {
                _MemoryManager.clearMemory();
                Control.removeProcessTable(-1);
                while(!_ResidentQueue.isEmpty()){
                    _ResidentQueue.dequeue();
                }
            }
        }

        public shellRunall(args) {
            if (_ResidentQueue.isEmpty()){
                _StdOut.putText("Nothing is loaded in memory.");
            }
            else {
                _Kernel.krnExecuteAllProcess();
            } 
        }

        public shellQuantum(args) {
            var valText = /^\d*$/;
            if (valText.test(args) && args != ""){
                _CpuScheduler.quantum = args;
            }
            else {
                _StdOut.putText("Quantum value must be an integer.");
            }  
        }

        public shellPs(args) {
            if (_CpuScheduler.activePIDList.length == 0){
                _StdOut.putText("No processes are active.");
            }
            else {
                _StdOut.putText("Active processes: " + _CpuScheduler.activePIDList.toString());
            }
        }

        public shellKill(args) {
            var valText = /^\d*$/;
            if (valText.test(args) && args != ""){
                _KernelInterruptQueue.enqueue(new Interrupt(KILL_IRQ, args));
            }
            else {
                _StdOut.putText("Please enter a valid pID after kill command.");
            }  
        }

        public shellCreate(args){
            var valText = /^[a-z]+$/i;
            var filename: string;
            if(valText.test(args)){
                filename = args;
                if(filename.length<60){
                    _Kernel.krnCreateFile(filename);
                }
                else{
                    _StdOut.putText("You can only have 60 character max for the file name.")    
                }
             }
             else{
                _StdOut.putText("Only letters can be used for the filename.")
            }
        }

        public shellWrite(args){
            var valName = /^[a-z\d]+$/i;
            var filename: string;
            var fileContent: string;
            if(valName.test(args[0])){
                filename = args[0];
                if(args.length<2){
                    _StdOut.putText("The written content must be encased in double quotes.");
                }
                else{
                    fileContent = args[1];                
                    for (var i=2; i<args.length; i++){
                        fileContent = fileContent + " " + args[i];
                    }
                    if(fileContent.charAt(0)!='"' || fileContent.charAt(fileContent.length-1)!='"'){
                        _StdOut.putText("File content must be in double quotes.");
                    }
                    else{
                        fileContent = fileContent.slice(1,fileContent.length-1);
                        _Kernel.krnWriteFile(filename, fileContent);
                    }
                }
            }
            else{
                _StdOut.putText("Only letters can be used for the filename.")
            }
        }

        public shellRead(args){
            var valText = /^[a-z]+$/i;
            var filename: string;
            if(valText.test(args)){
                filename = args;
                _Kernel.krnReadFile(filename);
            }
            else{
                _StdOut.putText("Only letters can be used for the filename.")
            }
        }

        public shellDelete(args){
            var valText = /^[a-z]+$/i;
            var filename: string;
            if(valText.test(args)){
                filename = args;
                _Kernel.krnDeleteFile(filename);
            }
            else{
                _StdOut.putText("Only letters can be used for the filename.")
            }
        }

        public shellLs(args){
            var files: string[] = _krnFileSystemDriver.listFiles();
            _StdOut.putText("Files: ");
            for(var file in files){
                _StdOut.putText(files[file] + "   ");
            }
        }

        public shellFormat(args){
            if(_CPU.isExecuting){
                _StdOut.putText("Cannot format disk. A process is currently running. Use kill command to terminate process.");
            }
            else{
                _StdOut.putText(_krnFileSystemDriver.formatDisk());
            }
        }

        public shellGetSchedule(args){
            _StdOut.putText("The current CPU scheduling method is " + _CpuScheduler.schedule);
        }

        public shellSetSchedule(args){
            _StdOut.putText(_CpuScheduler.setSchedule(args));
        }
    }
}