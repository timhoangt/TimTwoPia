///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, history, //storage of commands
        cycle, cyclePos) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (history === void 0) { history = []; }
            if (cycle === void 0) { cycle = -1; }
            if (cyclePos === void 0) { cyclePos = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.history = history;
            this.cycle = cycle;
            this.cyclePos = cyclePos;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
            this.history[0] = "NULL"; //creating ten storage slots for memory
            this.history[1] = "NULL";
            this.history[2] = "NULL";
            this.history[3] = "NULL";
            this.history[4] = "NULL";
            this.history[5] = "NULL";
            this.history[6] = "NULL";
            this.history[7] = "NULL";
            this.history[8] = "NULL";
            this.history[9] = "NULL";
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    //add whatever you entered to the memory
                    this.HistoryNew(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr == String.fromCharCode(8)) //dont allow backspace
                 {
                    this.deleteChar();
                    this.buffer = this.buffer.substr(0, this.buffer.length - 1);
                }
                else if (chr == String.fromCharCode(9)) //dont tab
                 {
                    this.deleteChar();
                    this.buffer = this.buffer.substr(0, this.buffer.length - 1);
                }
                else if (chr == String.fromCharCode(38)) //up arrow to go up in cycle
                 {
                    this.GetCyclePos(true);
                }
                else if (chr == String.fromCharCode(40)) //down arrow to go down in cycle
                 {
                    this.GetCyclePos(false);
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };
        Console.prototype.removeLastCharInQueue = function () {
            //get rid of last buffer
            this.buffer = this.buffer.substr(0, this.buffer.length - 1);
        };
        //go through the cycle depending on wether you want to go up or down
        Console.prototype.GetCyclePos = function (moveUp) {
            var match = false;
            var posList = this.cyclePos;
            var newPos = 0;
            if (moveUp) //did you press up arrow?
             {
                do {
                    if (this.history[this.cyclePos] != "NULL") //check for null
                     {
                        match = true;
                        newPos = this.cyclePos;
                    }
                    this.cyclePos--;
                    // place new cmd if matching
                    if (this.cyclePos < 0)
                        this.cyclePos = 9;
                } while ((this.cyclePos != posList) && !match);
            }
            else {
                // go through commands
                do {
                    if (this.history[this.cyclePos] != "NULL") {
                        match = true;
                        newPos = this.cyclePos;
                    }
                    this.cyclePos++;
                    if (this.cyclePos > 9)
                        this.cyclePos = 0;
                } while ((this.cyclePos != posList) && !match);
            }
            // Check if matching
            if (match) {
                this.ClearPrompt();
                this.buffer = this.history[newPos];
                this.putText(this.history[newPos]);
            }
        };
        Console.prototype.HistoryNew = function (cmd) {
            this.cycle++;
            if (this.cycle > 9) //check if you need to overwrite memory
                this.cycle = 0;
            this.cyclePos = this.cycle;
            this.history[this.cycle] = cmd;
        };
        Console.prototype.ClearPrompt = function () {
            var eraseWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            var yWidth = _DefaultFontSize + (2 * _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            this.currentXPosition -= eraseWidth;
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, eraseWidth, yWidth);
            this.buffer = "";
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                //get character length of input
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                var overflow = "";
                // will it go over the line?
                while ((this.currentXPosition + offset) > _Canvas.width) {
                    // store overflow text
                    overflow = text.charAt(text.length - 1) + overflow;
                    text = text.substr(0, text.length - 1);
                    // draw non-overflow text
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // go down one line
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    this.currentXPosition = this.currentXPosition + offset;
                    //if there is overflow
                    if (overflow.length > 0) {
                        //write it on new line
                        this.nextLine();
                        this.putText(overflow);
                    }
                }
            }
        };
        Console.prototype.nextLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // TODO: Handle scrolling. (iProject 1)
            var linePos = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // See if there are too many lines to fit in the canvas.
            if (_Canvas.height < this.currentYPosition) {
                // Change the Y position.
                this.currentYPosition = this.currentYPosition - linePos;
                // Copy whats on canvas.
                var lineMemory = _DrawingContext.getImageData(0, linePos, _Canvas.width, this.currentYPosition);
                // Reset canvas.
                this.clearScreen();
                //Reprint the data. 
                _DrawingContext.putImageData(lineMemory, 0, 0);
            }
        };
        Console.prototype.deleteChar = function () {
            //get new width
            var eraseWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(this.buffer.length - 1));
            var yWidth = _DefaultFontSize + (2 * _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            //go backwards one
            this.currentXPosition = this.currentXPosition - eraseWidth;
            //destroy previous character
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, eraseWidth, yWidth);
        };
        Console.prototype.BSOD = function (msg) {
            _DrawingContext.fillStyle = "blue"; //make the screen blue
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.fillStyle = "white";
            _DrawingContext.font = "30px Arial";
            _DrawingContext.fillText("YA DONE GOOFED", 150, 50); //add text and error message
            _DrawingContext.fillText("details:" + msg, 150, 100);
        };
        Console.prototype.commandCompletion = function () {
            var match = false;
            var sc = null;
            if (this.buffer == "")
                return;
            for (var i = 0; (i < _OsShell.commandList.length) && !match; i++) //this checks the commands
             {
                sc = _OsShell.commandList[i];
                if (sc.command.search(this.buffer) == 0) {
                    match = true;
                }
            }
            if (match) //when match is true, replace the text
             {
                this.putText(sc.command.substr(this.buffer.length));
                this.buffer = sc.command;
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
