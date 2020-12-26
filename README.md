# TimTwoPia

This is an operating system with shell commands and the ability to load and execute several user programs from a file system with a swapped virtual memory to execute more processes than memory partitions.

A video walkthrough of the program can be found here 

A working running version can be accessed without download here https://timhoangt.github.io/TimTwoPia/ but it will not perform the automatic Glados tests.

To run, just double click the index.html file to open in your browser. It will automatically run the tests as specified in glados-ip4.js.

If you choose to not run the project tests, comment or delete the following
```html
<script type="text/javascript" src="http://alanclasses.github.io/TSOS/test/glados-ip4.js">
</script>
```

## Buttons
*Start button boots up the OS to be ready for commands
*Halt button will shutdown the OS
*Reset button will reload the entire OS in an unstarted state
*Single Step button will make the processes run a single step at a time as needed
*Next Step button will allow the program to perform the next step if the Single Step button is active

## Console
To show a list of shell commands to run you can always type help into the console. It will list all of the commands as well as what they do.

## Host Log
Shows all of the OS message handling.

## User Program Input
The machine language opcode that the user can load onto the memory and disk.

## Time
Current time.

## Status
Current Status

## Memory
The Random Access Memory used to efficiently perform more than one task at a time.

## Processes
The list of loaded processes indicated by PID.

## CPU
The work that the operating system is doing.

## Disk
The long term storage that utilizes partitioning.
