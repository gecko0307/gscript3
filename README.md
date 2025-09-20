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
* [x] Array literals
* [x] Object literals
* [x] Function literals
* [x] Modules
* [ ] Standard library

## Main Changes from GScript2
- `let` istead of `var`
- `const` support
- Global execution context (instead of mandatory `main` function)
- Direct access to global variables, without `global`. `global` object is still there, for imports and externally defined properties
- JS-like object literals istead of prototype functions: `{ foo: "bar" }`
- New module system; see below
- No explicit referencing. Function reference is passed without `ref` keyword
- Array length is now returned by the built-in `length` property instead of a global `length` function
- `print` instead of `writeln`.

Architecture improvements:
- A more efficient ISA
- Standard `Variant` as a basis for the dynamic type system
- Bytecode can now be serialized into a binary buffer, significantly speeding up the launch of compiled scripts
- Tighter integration with the D object system. Any D object that inherits from `GsObject` and implements get/set semantics for its properties can be registered in the VM. This gives scripts secure access to the application's internal state.

## Modules
GScript3 implements object-based module system. To reuse code, store it in the `global` object under the name which should be used for importing. Typically this should be a singleton object with properties and methods:

foo.gs:
```
global.foo =
{
    prop: "foo.prop",
    test: func(self)
    {
        print self.prop;
    }
};
```

Now you can import and use this module:

main.gs:
```
import "foo.gs" as foo;

foo.test();
```

`foo` in this case is just an automatically defined shorthand for `global.foo`.

Curently there is no module-local scope! All root-level definitions are placed in one global scope, so it is not recommended to define global variables and free functions in modules to avoid name conflicts.
