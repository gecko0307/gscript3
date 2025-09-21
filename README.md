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
* [x] Prototypes
* [x] If/else
* [x] While loop
* [x] For loop
* [x] Do..while loop
* [x] Variadic arguments
* [ ] Standard library

## Main Changes from GScript2
- `let` istead of `var`
- `const` support
- Global execution context (instead of mandatory `main` function)
- Direct access to global variables, without `global`. `global` object is still there, for imports and externally defined properties
- JS-like object literals istead of prototype functions; see below
- Prototype inheritance instead of shallow-copy; see below
- New module system; see below
- A new, more efficient variadic arguments system; see below
- No explicit referencing. Function reference is passed without `ref` keyword
- Array length is now returned by the built-in `length` property instead of a global `length` function
- `print` instead of `writeln`.

Architecture improvements:
- Fast VM with a more efficient ISA
- Bytecode can now be serialized into a binary buffer, significantly speeding up the launch of compiled scripts
- Tighter integration with the D object system. Any D object that inherits from `GsObject` and implements get/set semantics for its properties can be registered in the VM. This gives scripts secure access to the application's internal state.

## Basic Usage
```
import gscript;

void main(string[] args)
{
    string script = "print \"Hello, World!\";";
    GsInstruction[] bytecode = compile(script);

    auto vm = new GsVirtualMachine();
    vm.load(bytecode);
    vm.run();
}
```

## Objects and Methods
Objects (key-value collections) are created using JS-like syntax. Objects can have methods (function properties) that always implicitly receive a reference to object itself as a first argument when called.

```
const obj = {
    foo: "bar",
    printFoo: func(self)
    {
        print self.foo;
    }
};

obj.printFoo();
```

## Prototype-Based Inheritance
GScript3 implements prototype-based OOP. Objects are created from other objects (prototypes), and property lookup follows the prototype chain: it first checks the object itself; if not found, it falls back to the prototype.

Example:

```
const Obj = {
    prop: "bar",
    test: func(self)
    {
        print self.prop;
    }
};

const f = new Obj;

Obj.prop = 10;   // property is changed in the prototype
f.test();        // prints 10 (inherited from prototype)

f.prop = 5;
f.test();        // prints 5 (now overrides prototype property)
```

## Modules
GScript3 implements object-based module system. To reuse code, store it in the `global` object under the name which should be used for importing. Typically this should be a singleton object with properties and methods:

foo.gs:
```
global.Foo = {
    prop: "Foo.prop",
    test: func(self)
    {
        print self.prop;
    }
};
```

Now you can import and use this module:

main.gs:
```
import Foo from "foo.gs";

Foo.test();
```

`Foo` in this case is just an automatically defined shorthand for `global.Foo`.

Currently there is no module-local scope! All root-level definitions are placed in one global scope, so it is not recommended to define global variables and free functions in modules to avoid name conflicts.

## Variadic Arguments
In GScript3, all functions can accept any number of arguments. Named arguments list is optional. Anonymous arguments are accessed with `$` operator:

```
func test
{
    print $0;
    print $1;
    print $2;
}

test(5, 10, 20);
```

A special operator `$$` retrieves all arguments passed with the call as a mutable array. It is actually a slice to the stack frame parameters, so a new array is not created.

```
func test
{
    const args = $$;
    print args.length;
    args[0] = 100;
    print $$; // first argument is now 100
}

test(5, 10, 20);
```

## Binding Native Functions

```
GsDynamic printSum(GsDynamic[] args)
{
    auto vm = cast(GsVirtualMachine)args[0].asObject;
    auto a = args[1].asNumber;
    auto b = args[2].asNumber;
    writeln(a + b);
    return GsDynamic(0);
}

vm["printSum"] = &printSum;
```

Script:

```
global.printSum(5, 3);
```

## Binding Native Objects

Any object that implements `GsObject` interface is compatible with `GsDynamic`:

```
class MyObj: GsObject
{
    int x = 0;
    
    this()
    {
    }
    
    GsDynamic foo(GsDynamic[] args)
    {
        writeln("MyObj.foo called");
        return GsDynamic(0);
    }
    
    GsDynamic get(string key)
    {
        if (key == "x")
            return GsDynamic(x);
        else if (key == "foo")
            return GsDynamic(&foo);
        else
            return GsDynamic(0.0);
    }
    
    void set(string key, GsDynamic value)
    {
        if (key == "x")
            x = cast(int)value.asNumber;
    }
    
    bool contains(string key)
    {
        if (key == "x") return true;
        else return false;
    }
    
    GsObject dup()
    {
        MyObj copy = new MyObj();
        copy.x = x;
        return copy;
    }
}

TestObj test = new TestObj();
vm["test"] = test;
```

Script:

```
global.test.x = 10;
print global.test.x;
global.test.foo();
```
