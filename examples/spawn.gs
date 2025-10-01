const thread = spawn func(self, init)
{
    self.i = init;
    while(self.i < 10)
    {
        print self.i;
        self.i += 1;
    }
}(5);

print "Thread started, waiting...";

while(thread.running)
{
    // busy-wait
}

print "Thread terminated";
print thread.i;
