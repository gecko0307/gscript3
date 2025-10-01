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

print "Thread started, awaiting for results...";

while(thread.running)
{
    print sync thread;
    thread.resume();
}

print "Thread terminated";
