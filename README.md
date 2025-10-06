# GScript3

Work-in-progress third iteration of GScript, a mini scripting language written in D.

GScript3 is a concurrent dynamically-typed language aimed at easy embedding and extending.

```
print "Hello, World!";
```

## Development Roadmap
* [x] VM
* [x] Parser
* [x] Codegen
* [x] Bytecode serializer
* [x] External state access
* [x] Arena heap
* [x] VM builtins
* [x] Multithreading
* [x] Channels
* [x] Basic build system
* [x] Expose command line arguments
* [x] Error handling
* [x] Macros, compile-time evaluation
* [ ] Standard library

## Why GScript3?
Most popular scripting engines are too cumbersome for embedding in languages other than C/C++. They also come with lots of architectural quirks, heavy runtimes and verbose APIs. GScript3 is designed to be:
- **Simple** - easy to embed into any D application with minimal effort, as well as to "compile" into standalone executables;
- **Lightweight** - a minimalistic VM with no hidden GC costs;
- **Concurrent** - built-in green threads, coroutines, and channels;
- **Extensible** - enables host applications to expose their functions and define specialized runtime objects;
- **Familiar** - concise, JavaScript-like syntax.

## Main Changes from GScript2
- `let` istead of `var`
- `const` support
- Global execution context (instead of mandatory `main` function)
- Direct access to global variables, without `global`. `global` object is still there, for imports and externally defined properties
- JS-like object literals istead of prototype functions; see below
- Prototype inheritance instead of shallow-copy; see below
- New module system; see below
- New variadic arguments system; see below
- Implicit function referencing. Function reference is created without `ref` keyword
- Array length is now returned by the built-in `length` property instead of a global `length` function
- `print` instead of `writeln`
- Spawning functions as threads/coroutines; see below
- AST macros; see below.

Architecture improvements:
- Fast VM with a more efficient ISA
- VM-level preemptive multithreading ("green threads"). Threads are first-class citizens integrated into the prototype inheritance model
- Host-defined synchronization primitives
- Arena heap instead of the GC for internal allocations. VM is fully GC-free (compiler is not yet)
- Bytecode can now be serialized into a binary buffer, significantly speeding up the launch of compiled scripts
- Flexible exposing and integration with the D object system. Any D object that inherits from `GsObject` and implements get/set semantics for its properties can be registered in the VM. This gives scripts secure access to the application's internal state.

## Usage

Gscript3 interpreter comes in two forms - `gs` and `gsrunner`.
- `gs` is the main command line tool to run and compile scripts;
- `gsrunner` is a runtime stub used to distribute standalone applications packed with compiled bytecode.

Running a script:

`gs -i script.gs`

Compiling a script without running:

`gs -c -i script.gs`

GScript3 interpreter automatically compiles scripts to a bytecode file (*.gsc). It can be executed instead of the script itself:

`gs -i script.gsc`

The interpreter automatically loads and runs `main.gs` or `main.gsc` file from the executable directory if you don't specify an input file. So you can ship `gs` executable with `main.gsc` bytecode file to end users. Alternatively, you can pack the bytecode with `gsrunner` into a single executable using the `--build` command:

`gs --build` or `gs -b`

This requires project config `gsproject.json` that looks like this:

```json
{
    "main": "sc/main.gs",
    "target": "app.exe",
    "version": "1.0.0",
    "icon": "icon.ico"
}
```

## Embedding

Note: Gscript3 is not a DUB package yet; the embedding API is unstable.

Basic script compilation and running:

```d
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

Exposing native functions:

```d
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

You can expose any object that implements `GsObject` interface:

```d
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

## Type Checking

The type of a dynamic value can be compared against a type-constant using the `:` operator:

```
const x = 10;
if (x: Number)
{
    // ...
}
```

Alternatively, the type can be yielded as a value using `type` keyword and compared using ordinary comparison operators. This is useful for type logics:

```
if (type(x) != Null)
{
    // ...
}

if (type(x) == type(y))
{
    // ...
}
```

Type-constants are the following:

```
Null = 0
Number = 1
String = 2
Array = 3
Object = 4
NativeMethod = 5
NativeFunction = 6
Error = 7
Function = 8
```

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

let running = true;
while(running)
{
    // busy-wait
    running = thread.running;
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

let running = true;
while(running)
{
    running = thread.running;
    print await thread; // prints yield values
}
```

`await` doesn't pause the thread on `yield`. Alternatively, `sync` can be used instead to pause execution and synchronize state. In such case, `thread.resume()` should be called afterwards:

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

let running = true;
while(running)
{
    running = thread.running;
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

let running = true;
while(running)
{
    running = thread.running;
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

let running = true;
while(running)
{
    running = thread.running;
    print sync thread;
    thread.foo = "test";
    thread.resume();
}

print thread.foo; // "test"
```

## Memory Isolation

By default threads allocate their dynamic data in isolated local heaps. Thread-local reference types (objects, arrays, dynamically constructed strings) are not allowed to escape outside the thread's context. Using `shared` keyword you can explicitly create data in the global heap to safely escape references:

```
const thread = spawn func
{
    const arr1 = shared [10, 5, 6];
    const arr2 = [10, 5, 6];
    
    global.arr = arr1; // ok
    global.arr = arr2; // error!
};
```

`shared` applies to the construction operation (an operation that allocates memory). So, for example, string concatenation should be marked as `shared` to allocate the result in the global heap:

```
const s = shared("a" ~ "b");
```

Compound assignment operations that allocate memory should also be marked as `shared` for global access:

```
const thread = spawn func
{
    global.arr = shared [0, 1, 2];
    shared global.arr ~= 3;
};
```

Escape checker disallows passing thread-local data to external functions (excluding builtins such as array methods). This can be **unsafely** bypassed using `escape` operator:

```
func test(value)
{
    print value;
}

const thread = spawn func
{
    const arr = [0, 1, 2];
    test(escape arr);
};
```

`escape`, like `shared`, applies to the result of the expression. It explcitly marks the value as owned by the main thread, so it can be passed around freely. Using it may result in dangling references once the thread is released. Generally, it is not recommended to escape references; it's a relaxation for special cases when the programmer takes responsibility for the outcome.

When you are completely done with the thread and no longer need its memory, you can release it - reset its heap and return it to the pool for reuse:

```
thread.release();
```

## Error Handling

Threads usually don't crash the VM on error. Instead they print a stack trace and yield an error value. On the other hand, error in the main thread is considered fatal for the VM.

Manually yielding an error:

```
func threadFunc()
{
    return error("BADBEAF");
}
```

Catching errors:

```
const thread = spawn threadFunc;

let running = true;
while(running)
{
    running = thread.running;
    const result = await thread;
    if (result: Error)
    {
        print result;
    }
}
```

To terminate a thread instantly, `raise` is used. This mechanism is akin to exceptions:

```
func test()
{
    raise error("Something");
}

func threadFunc()
{
    test();
}

const thread = spawn threadFunc;

let running = true;
while(running)
{
    running = thread.running;
    const result = await thread;
    if (result: Error)
    {
        print result;
    }
}
```

`raise` yields an arbitrary value, which is usually an error value, but can be anything. The semantics of raising is not necessarily an error, it is application-specific.

## Channels

Channel is a bidirectional inter-thread communication and synchronization primitive. When `send` is called, producer thread is blocked until the message is received by another thread. When `receive` is called, concumer thread is blocked until there is a message available.

```
const ch = global.channel();

const thread1 = spawn func
{
    print ch.receive();
    ch.send("world");
};

const thread2 = spawn func
{
    ch.send("hello");
    print ch.receive();
};
```

## AST Macros

Macro is an abstract expression alias:

```
macro test = (x < 10);

let x = 0;
while (test)
{
    print x;
    x += 1;
}
```

It is convenient to define shorthands for long reference chains:

```
const obj = {
    foo: {
        bar: 10
    }
};

macro bar = obj.foo.bar;
print bar;

macro format = global.string.format;
print format("Value: %0", 100);
```

If possible, macro is evaluated at compile-time taking other macros into account, so it is possible to do simple constant expressions:

```
macro PI = 3.14159;
macro PI2 = PI * 2;
print PI2;
```

Compile-time evaluation is only supported for basic numeric operations and string concatenation.

There is support for parameterized macro expansion, which makes macros idiomatically close to templates. Unlike template specialization, macro expansion substitutes named parameters with AST expressions rather than data types:

```
macro sum(a, b) = a + b;
```

The above macro can expand into a literal:

```
print sum{3, 4}; // print 7
```

...or into an expression:

```
const x = 10;
print sum{x, 4}; // print x + 4
```

In contrast to global variables and functions, macros are defined in module's local context and cannot be imported.

Function macros and statement macros are not supported at the moment.
