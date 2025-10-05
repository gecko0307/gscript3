macro format = global.string.format;

func threadFunc()
{
    yield 10;
    return error("BADBEAF");
}

const thread = spawn threadFunc;

while(thread.running)
{
    print await thread;
}

const res = await thread;
if (res: Error)
    print format("Error: %0", res);
else
    print "OK";
