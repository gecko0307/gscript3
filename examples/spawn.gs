const thread = spawn func(self, init)
{
    self.i = init;
    while(self.i < 10)
    {
        print self.i;
        self.i += 1;
    }
    
    return self.i;
}(5);

print "Thread started, waiting...";

const v = await thread;
print v;
