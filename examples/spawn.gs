const thread = spawn func(self)
{
    self.i = 0;
    while(self.i < 10)
    {
        print self.i;
        self.i += 1;
    }
};

print "Thread started, waiting...";

while(thread.running)
{
    // busy-wait
}

print "Thread terminated";
print thread.i;
