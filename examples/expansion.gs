// Constant expressions, compile-time evaluation
macro PI = 3.14159;
macro PI2 = PI * 2;
print PI2;

macro eval(v) = v;
print eval{10 + 10};

// Expanding expressions
macro compare(a, b) = a > b;

const x = 10;
const y = 5;

if (compare{x, y})
    print "X is bigger!";

// Expanding literals
macro vec(n) = array(n, 0);
const v = vec{3};
print v;

macro Obj(n) = {
    foo: n
};

const ob = Obj{"Hello, " ~ "World!"};
print ob.foo;
