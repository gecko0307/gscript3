const obj = {
    x: 100,
    foo: func(this, x)
    {
        this.x += x;
        print this.x;
    }
};

obj.foo(10);
