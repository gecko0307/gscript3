func fib_loop(n)
{
    let prev = 0;
    let next = 1;
    if (n == 0) return 0;
    if (n == 1) return 1;

    let i = 2;
    let result = 0;
    while(i <= n)
    {
        result = prev + next;
        prev = next;
        next = result;
        i += 1;
    }
    return result;
}

print fib_loop(40);
