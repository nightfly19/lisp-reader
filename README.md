# Lisp-Reader

A Lisp reader that was designed to be extended with reader macros.

## Included Reader Macros

* *Lists*
Reads a list of valid s-expressions contained within '(' and ')' tokens.
Current behavior is to read lists in as arrays.

Dispatched by the /^(/ pattern. 
Reads valid s-expressions until the symbol ')' is read (')' is read in in it's own reader macro). 

* *Number*
Reads a JavaScript style number.

Dispatched by the /^[0-9] pattern. 
Reads in a number matching /^([0-9]+\.?[0-9]*)$/ and calls Number on the token.

* *String*
Reads a string '"' enclosed string
No escape sequences are currently supported.

Dispatched by the /^\"/ pattern. 
Reads in a token matching /^"(?:(?:[^"])|(?:\\"))*"$/ and extracted everthing except the first and last character
