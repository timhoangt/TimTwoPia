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
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellVer, "v");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellVer, "version");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays the current location.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Updates the status on the console.");
            this.commandList[this.commandList.length] = sc;
            // error
            sc = new TSOS.ShellCommand(this.shellError, "error", "<string> - Triggers an error for testing BSOD.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "<hex digit(s)> - Loads and validates user code.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- <pid> - Runs the process according to their pID.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "- Wipes the memory clean.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", "- Runs all of the loaded processes.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- <int> - Changes the Round Robin quantum.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "Lists the running processes and their IDs.");
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kills the specified process id.");
            this.commandList[this.commandList.length] = sc;
            // create <string>
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<string> - Creates a file with the specified name.");
            this.commandList[this.commandList.length] = sc;
            // write <string> "string"
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<string> - Writes content to specified file.");
            this.commandList[this.commandList.length] = sc;
            // read <filename>
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<string> - Reads content of specified file.");
            this.commandList[this.commandList.length] = sc;
            // delete <filename>
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<string> - Deletes specified file.");
            this.commandList[this.commandList.length] = sc;
            // ls
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "Lists all files on disk.");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "Formats drive.");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. Here are some suggestions: ");
            var match = false;
            var sc = null;
            var buffer = "";
            for (var i = 0; (i < _OsShell.commandList.length) && !match; i++) //this checks the commands
             {
                sc = _OsShell.commandList[i];
                if (sc.command.search(buffer) == 0) {
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
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.nextLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.nextLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.nextLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
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
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            _StdOut.putText(day + "/" + month + "/" + year);
        };
        Shell.prototype.shellWhereami = function (args) {
            var d = new Date(); // or whatever date you have
            var tzName = d.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
            _StdOut.putText("You are in " + tzName);
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0)
                TSOS.Control.updateStatus(args.join(' '));
            else
                _StdOut.putText("Usage: status <string> - Please supply a string.");
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellError = function (args) {
            if (args.length > 0)
                _Kernel.krnTrapError(args.join(' '));
            else
                _StdOut.putText("Usage: error <string> - Please supply a string.");
        };
        Shell.prototype.shellLoad = function (args) {
            var programInput = document.getElementById("taProgramInput").value;
            programInput = programInput.replace(/(\r\n|\n|\r)/gm, "");
            var input = /^[a-f\d\s]+$/i; //hex digit filter
            if (input.test(programInput)) { //test if text matches hex digit
                var inputOpCodes = programInput.split(" ");
                if (inputOpCodes.length > 256) {
                    _StdOut.putText("Not enough memory for this program.");
                }
                else {
                    var baseReg = _MemoryManager.loadMemory(inputOpCodes);
                    if (baseReg == 999) {
                        _StdOut.putText("Memory is full.");
                    }
                    else {
                        var pid = _Kernel.krnCreateProcess(baseReg);
                        _StdOut.putText("pID " + pid + " is in resident Queue");
                    }
                }
            }
            else if (programInput == "") {
                _StdOut.putText("Please enter 6502a op codes in the input area below.");
            }
            else {
                _StdOut.putText("Please enter a hex digit."); //if it doesnt match
            }
        };
        Shell.prototype.shellRun = function (args) {
            var input = /^\d*$/;
            if (input.test(args) && args != "") {
                if (_ResidentQueue.isEmpty()) {
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
        };
        Shell.prototype.shellClearmem = function (args) {
            if (_CPU.isExecuting) {
                _StdOut.putText("Cannot clear memory. A process is currently running. Use kill command to terminate process.");
            }
            else {
                _MemoryManager.clearMemory();
                TSOS.Control.removeProcessTable(-1);
                while (!_ResidentQueue.isEmpty()) {
                    _ResidentQueue.dequeue();
                }
            }
        };
        Shell.prototype.shellRunall = function (args) {
            if (_ResidentQueue.isEmpty()) {
                _StdOut.putText("Nothing is loaded in memory.");
            }
            else {
                _Kernel.krnExecuteAllProcess();
            }
        };
        Shell.prototype.shellQuantum = function (args) {
            if (_CpuScheduler.activePIDList.length == 0) {
                _StdOut.putText("No process is active");
            }
            else {
                _StdOut.putText("Active processes [" + _CpuScheduler.activePIDList.toString() + "]");
            }
        };
        Shell.prototype.shellPs = function (args) {
            if (_CpuScheduler.activePIDList.length == 0) {
                _StdOut.putText("No processes are active");
            }
            else {
                _StdOut.putText("Active processes: " + _CpuScheduler.activePIDList.toString());
            }
        };
        Shell.prototype.shellKill = function (args) {
            var valText = /^\d*$/;
            if (valText.test(args) && args != "") {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KILL_IRQ, args));
            }
            else {
                _StdOut.putText("Please enter a valid pID after kill command.");
            }
        };
        Shell.prototype.shellCreate = function (args) {
            var valText = /^[a-z\d\s]+$/i;
            var filename;
            if (valText.test(args)) {
                filename = args;
            }
            else {
                _StdOut.putText("Please only use letters and numbers for the filename.");
            }
        };
        Shell.prototype.shellWrite = function (args) {
            var valText = /^[a-z\d\s]+$/i;
            var filename;
            if (valText.test(args)) {
                filename = args;
            }
            else {
                _StdOut.putText("Please only use letters and numbers for the filename");
            }
        };
        Shell.prototype.shellRead = function (args) {
            var valText = /^[a-z\d\s]+$/i;
            var filename;
            if (valText.test(args)) {
                filename = args;
            }
            else {
                _StdOut.putText("Please only use letters and numbers for the filename");
            }
        };
        Shell.prototype.shellDelete = function (args) {
            var valText = /^[a-z\d\s]+$/i;
            var filename;
            if (valText.test(args)) {
                filename = args;
            }
            else {
                _StdOut.putText("Please only use letters and numbers for the filename");
            }
        };
        Shell.prototype.shellLs = function (args) {
        };
        Shell.prototype.shellFormat = function (args) {
            if (_CPU.isExecuting) {
                _StdOut.putText("Cannot format disk. A process is currently running. Use kill command to terminate process.");
            }
            else {
                _krnFileSystemDriver.formatDisk();
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
