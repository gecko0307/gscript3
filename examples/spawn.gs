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
    thread.resume(); // resume execution
}

print obj.foo; // "test"
