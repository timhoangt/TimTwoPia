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
        function Console() {
        }
<<<<<<< HEAD
=======
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
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
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
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
            for (var i = 0; (i < _OsShell.commandList.length) && (match = false); i++) //this checks the commands
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
>>>>>>> parent of ea0e1c7... changed format of commandCompletion
        return Console;
    }());
    TSOS.Console = Console;
    init();
    void {
        "this": .clearScreen(),
        "this": .resetXY(),
        "this": .history[0] = "",
        "this": .history[1] = "",
        "this": .history[2] = "",
        "this": .history[3] = "",
        "this": .history[4] = "",
        "this": .history[5] = "",
        "this": .history[6] = "",
        "this": .history[7] = "",
        "this": .history[8] = "",
        "this": .history[9] = ""
    };
    clearScreen();
    void {
        _DrawingContext: .clearRect(0, 0, _Canvas.width, _Canvas.height)
    };
    resetXY();
    void {
        "this": .currentXPosition = 0,
        "this": .currentYPosition = this.currentFontSize
    };
    handleInput();
    void {
        "while": function (_KernelInputQueue, getSize) { }
    }() > 0;
    {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
        if (chr === String.fromCharCode(13)) { //     Enter key
            // The enter key marks the end of a console command, so ...
            // ... tell the shell ...
            _OsShell.handleInput(this.buffer);
            // ... and reset our buffer.
            this.newHistory(this.buffer); //add to command memory
            this.buffer = "";
        }
        else if (chr == String.fromCharCode(8)) //dont allow backspace
         {
            this.deleteChar();
            this.buffer = this.buffer.substr(0, this.buffer.length - 1);
        }
        else if (chr == String.fromCharCode(9)) //dont tab
         {
        }
        else if (chr == String.fromCharCode(38)) {
            this.getCyclePos(true);
        }
        else if (chr == String.fromCharCode(40)) {
            this.getCyclePos(false);
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
})(TSOS || (TSOS = {}));
putText(text);
void {
    // My first inclination here was to write two functions: putChar() and putString().
    // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
    // between the two.  So rather than be like PHP and write two (or more) functions that
    // do the same thing, thereby encouraging confusion and decreasing readability, I
    // decided to write one function and use the term "text" to connote string or char.
    //
    // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
    //         Consider fixing that.
    "if": function (text) { }
} !== "";
{
    // Draw the text at the current X and Y coordinates.
    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
    // Move the current X position.
    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
    this.currentXPosition = this.currentXPosition + offset;
}
nextLine();
void {
    "this": .currentXPosition = 0,
    /*
     * Font size measures from the baseline to the highest point in the font.
     * Font descent measures from the baseline to the lowest point in the font.
     * Font height margin is extra spacing between the lines.
     */
    "this": .currentYPosition += _DefaultFontSize +
        _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
        _FontHeightMargin,
    // TODO: Handle scrolling. (iProject 1)
    "var": linePos, number: number,
    // See if there are too many lines to fit in the canvas.
    "if": function (_Canvas, height, , currentYPosition) {
        // Change the Y position.
        this.currentYPosition = this.currentYPosition - linePos;
        // Copy whats on canvas.
        var lineMemory = _DrawingContext.getImageData(0, linePos, _Canvas.width, this.currentYPosition);
        // Reset canvas.
        this.clearScreen();
        //Reprint the data. 
        _DrawingContext.putImageData(lineMemory, 0, 0);
    }
    //add to history
    ,
    //add to history
    "this": .history.push(this.buffer)
};
deleteChar();
void {
    //get new width
    "var": eraseWidth, number: number,
    "var": yWidth, number: number,
    //go backwards one
    "this": .currentXPosition = this.currentXPosition - eraseWidth,
    //destroy previous character
    _DrawingContext: .clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, eraseWidth, yWidth)
};
BSOD(msg, string);
void {
    _DrawingContext: .fillStyle = "blue",
    _DrawingContext: .fillRect(0, 0, _Canvas.width, _Canvas.height),
    _DrawingContext: .fillStyle = "white",
    _DrawingContext: .font = "30px Arial",
    _DrawingContext: .fillText("YA DONE GOOFED", 150, 50),
    _DrawingContext: .fillText("details:" + msg, 150, 100)
};
commandCompletion();
void {
    "var": match, boolean: boolean,
    "var": sc, ShellCommand: ShellCommand,
    "if": function (buffer) { }
} == "";
return;
for (var i = 0; (i < _OsShell.commandList.length) && (match = false); i++) //this checks the commands
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
