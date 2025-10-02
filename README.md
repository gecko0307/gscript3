# GScript3

Work-in-progress third iteration of GScript, a mini scripting language for D. Future successor of [GScript2](https://github.com/gecko0307/gscript2).

## Development Roadmap
* [x] VM
* [x] Parser
* [x] Codegen
* [x] Bytecode serializer
* [x] External state access
* [x] Arena heap
* [x] VM builtins
* [x] Green threads + coroutines
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
- `print` instead of `writeln`
- Spawning functions as threads/coroutines; see below.

Architecture improvements:
- Fast VM with a more efficient ISA
- VM-level preemptive multithreading ("green threads"). Threads are first-class citizens integrated into the prototype inheritance model
- Arena heap instead of the GC for internal allocations. VM is fully GC-free (compiler is not yet)
- Bytecode can now be serialized into a binary buffer, significantly speeding up the launch of compiled scripts
- Tighter integration with the D object system. Any D object that inherits from `GsObject` and implements get/set semantics for its properties can be registered in the VM. This gives scripts secure access to the application's internal state.

## Usage

Run a script:

`gs -i script.gs`

Compile a script to bytecode:

`gs -c -i script.gs`

## Embedding

Note: Gscript3 is not a DUB package yet; the embedding API is unstable.

Basic script compilation and running:
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

Binding native functions:

```
GsDynamic printSum(GsDynamic[] args)
{
    // First argument is always VM itself (a `global` object)
    auto vm = cast(GsVirtualMachine)args[0].asObject;
    
    // Type checking is omitted for simplicity, but highly recommended
    auto a = args[1].asNumber;
    auto b = args[2].asNumber;
    writeln(a + b);
    
    // Return `undefined` for void-like behaviour
    return GsDynamic();
}

vm["printSum"] = &printSum;
```

Script:

```
global.printSum(5, 3);
```

You can bind any object that implements `GsObject` interface:

```
class MyObj: GsObject
{
    GsObject prototype;
    
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
    
    void setPrototype(GsObject proto)
    {
        prototype = proto;
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

## Threads

```
const thread = spawn func
{
    let i = 0;
    while(i < 10)
    {
        print i;
        i += 1;
    }
};

while(thread.running)
{
    // busy-wait
}
```

## Coroutines

```
const thread = spawn func
{
    let i = 0;
    
    i += 1;
    yield i;
    
    i += 2;
    yield i;
    
    i += 3;
    return i;
};

while(thread.running)
{
    print await thread; // prints yield values
}
```

Alternatively, `sync` can be used instead of `await` to pause execution and synchronize state:

```
const thread = spawn(null, 5) func(self, init)
{
    self.i = init;
    
    self.i += 1;
    yield self.i;
    
    self.i += 2;
    yield self.i;
    
    self.i += 3;
    return self.i;
};

while(thread.running)
{
    print sync thread;
    thread.i = 0; // modify thread's payload while synchronized
    thread.resume();
}
```

Spawning methods and using custom payload objects:

```
const obj = {
    test: func(self, init)
    {
        self.i = init;
        
        self.i += 1;
        yield self.i;
        
        self.i += 2;
        yield self.i;
        
        self.i += 3;
        return self.i;
    }
};

const thread = spawn(obj, 5) obj.test;

while(thread.running)
{
    print sync thread;
    thread.foo = "test";
    thread.resume();
}

print obj.foo; // "test"
```

Create a new payload object from a prototype:

```
const obj = {
    test: func(self, init)
    {
        self.i = init;
        
        self.i += 1;
        yield self.i;
        
        self.i += 2;
        yield self.i;
        
        self.i += 3;
        return self.i;
    }
};

const thread = spawn(new obj, 5) obj.test;

while(thread.running)
{
    print sync thread;
    thread.foo = "test";
    thread.resume();
}

print thread.foo; // "test"
```
