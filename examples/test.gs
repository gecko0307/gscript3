func foo()
{
    print "foo";
}

const arr = [2, [0, 100], foo];
print arr[1][1];
arr[2]();
