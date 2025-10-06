// Constant expressions and compile-time evaluation
macro PI = 3.14159;
macro PI2 = PI * 2;
print PI2;

macro eval(v) = v;
print eval{10 + 10 + 10};

// Expanding expressions
macro compare(a, b) = a > b;

const x = 5;
const y = 5;

if (compare{x + 1, y})
    print "x is bigger!";

// Expanding literals
macro vec(n) = array(n, 0);
const v = vec{3};
print v;

macro Obj(n) = {
    foo: n
};

const ob = Obj{"Hello, " ~ "World!"};
print ob.foo;

// Property chain aliases
macro format = global.string.format;
print format("Value: %0", 100);
