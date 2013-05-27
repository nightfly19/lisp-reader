# Lisp-Reader

A Lisp reader that was designed to be extended with reader macros.

## Included Reader Macros

### Lists
Reads a list of valid s-expressions contained within '(' and ')' tokens.
Current behavior is to read lists in as arrays.

### Numbers
Reads a JavaScript style number.

### Strings
Reads a string '"' enclosed string.
No escape sequences are currently supported.

### Symbols
Reads in (most) valid identitiers (and probably lots of invalid ones) and creates a Symbol object from them.
