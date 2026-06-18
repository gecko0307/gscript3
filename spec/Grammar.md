# GScript 3 Specification. Grammar

## Operator precedence

1. Unary: `-a`, `+a`, `!a`
2. Multiplication, division, modulo, power: `a * b`, `a / b`, `a % b`, `a ^^ b`
3. Addition, subtraction: `a + b`, `a - b`
4. Type check: `a: b`
5. Comparison: `a > b`, `a < b`, `a == b`, `a >= b`, `a <= b`, `a != b`
6. Bitwise AND, bitwise OR, bitwise XOR: `a & b`, `a | b`, `a ^ b`
7. Logical AND, logical OR: `a && b`, `a || b`
8. Concatenation: `a ~ b`
9. Assignment: `a = b`, `a += b`, `a -= b`, `a *= b`, `a /= b`, `a &= b`, `a |= b`, `a ^= b`, `a ~= b`

## Variables

To define a local variable, `let` or `const` keywords are used.

```
let x;
x = 10;
const y = 5;
```

`const` variable can be assigned a value only once. Re-assignment for such variables yields a compile-time error.

## Functions

A function is declared using `func` keyword.

```
func test(a, b)
{
    let result = a + b;
    return result;
}
```

Alternatively, a variable can store a reference to anonymous function:

```
const test = func(a, b)
{
    let result = a + b;
    return result;
};
```

Function can accept any number of arguments. Named argument list is optional. Individual anonymous arguments are accessed with `$` operator:

```
func test
{
    print $0;
    print $1;
    print $2;
}

test(5, 10, 20);
```

A special operator `$$` retrieves all arguments passed with the call as an array (a slice to the stack frame parameters):

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

## If-block

TODO
