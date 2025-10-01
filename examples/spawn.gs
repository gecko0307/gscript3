const thread = spawn func(self, init)
{
    self.i = init;
    
    self.i += 1;
    yield self.i;
    
    self.i += 2;
    yield self.i;
    
    self.i += 3;
    return self.i;
}(5);

while(thread.running)
{
    print sync thread;
    thread.i = 0; // do something while synchronized
    thread.resume(); // resume execution
}
