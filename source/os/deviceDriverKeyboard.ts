///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (   
                        (keyCode == 32)                     ||   // space
                    /*(keyCode == 188)                    ||  //comma
                    (keyCode == 190)                    ||  //period
                   ((keyCode >= 186) && (keyCode <= 222))||   // punctuation and symbols
                   ((keyCode >= 104) && (keyCode <= 111))||   // more symbols*/
                    (keyCode == 13)) {                       // enter 
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
                else if ((keyCode >= 48) && (keyCode <= 57) ||//digits
                        (keyCode >= 186) && (keyCode <= 192)||// semicolon, equals, comma, minus, period, forward slash, tick
                        (keyCode >= 219) && (keyCode <= 222)){//left bracket, back slash, right bracket, single quotes
    
                        if (isShifted) { //check if shift, if it is, set it to the symbol
                            if (keyCode == 48){
                            chr = ")";
                            }
                            else if (keyCode == 49){
                            chr = "!";
                            }
                            else if (keyCode == 50){
                                chr = "@";
                            }
                            else if (keyCode == 51){
                                chr = "#";
                            }
                            else if (keyCode == 52){
                                chr = "$";
                            }
                            else if (keyCode == 53){
                                chr = "%";
                            }
                            else if (keyCode == 54){
                                chr = "^";
                            }
                            else if (keyCode == 55){
                                chr = "&";
                            }
                            else if (keyCode == 56){
                                chr = "*";
                            }
                            else if (keyCode == 57){
                                chr = "(";
                            }
                            else if (keyCode == 186){
                                chr = ":";
                            }
                            else if (keyCode == 187){
                                chr = "+";
                            }
                            else if (keyCode == 188){
                                chr = "<";
                            }
                            else if (keyCode == 189){
                                chr = "_";
                            }
                            else if (keyCode == 190){
                                chr = ">";
                            }
                            else if (keyCode == 191){
                                chr = "?";
                            }
                            else if (keyCode == 192){
                                chr = "~";
                            }
                            else if (keyCode == 219){
                                chr = "{";
                            }
                            else if (keyCode == 220){
                                chr = "|";
                            }
                            else if (keyCode == 221){
                                chr = "}";
                            }
                            else if (keyCode == 222){
                                chr = "\"";
                            }
                        }
                            else if (keyCode == 186){ //if not shifted, set it to normal symbol
                                chr = ";";
                            }
                            else if (keyCode == 187){
                                chr = "=";
                            }
                            else if (keyCode == 188){
                                chr = ",";
                            }
                            else if (keyCode == 189){
                                chr = "-";
                            }
                            else if (keyCode == 190){
                                chr = ".";
                            }
                            else if (keyCode == 191){
                                chr = "/";
                            }
                            else if (keyCode == 192){
                                chr = "`";
                            }
                            else if (keyCode == 219){
                                chr = "[";
                            }
                            else if (keyCode == 220){
                                chr = '\\';
                            }
                            else if (keyCode == 221){
                                chr = "]";
                            }
                            else if (keyCode == 222){
                                chr = "'";
                            }
                        else {
                            chr = String.fromCharCode(keyCode); //use this for numbers so no long code
                        }
                        _KernelInputQueue.enqueue(chr);
                }
                else if( keyCode == 8 ) // backspace
            {
                chr = String.fromCharCode(8);;
                _KernelInputQueue.enqueue(chr);
            }
            }
        }
}
