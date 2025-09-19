# GScript3

Work-in-progress third iteration of GScript, a mini scripting language for D. Future successor of [GScript2](https://github.com/gecko0307/gscript2).

## Development Roadmap
* [x] VM
* [x] Parser
* [x] Codegen
* [x] Bytecode serializer
* [x] External state access
* [x] Basic language features
* [x] Objects and arrays (partially)
* [ ] Object literals
* [ ] Array literals
* [ ] Modules and name mangling
* [ ] Standard library

## Main Changes from GScript2
- `let` istead of `var`
- `const` support
- Global execution context (instead of mandatory `main` function)
- Direct access to global variables, without `global`. `global` object is still there, for externally defined properties
- Array length now returned by the built-in `length` property instead of a global `length` function
- `print` instea of `writeln`.

Architecture improvements:
- A more efficient ISA
- Bytecode can now be serialized into a binary buffer, significantly speeding up the launch of compiled scripts
- Tighter integration with the D object system. Any D object that inherits from `GsObject` and implements get/set semantics for its properties can be registered in the VM. This gives scripts secure access to the application's internal state.
