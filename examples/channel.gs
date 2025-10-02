const ch = global.channel();

const thread1 = spawn func
{
    print ch.receive();
    ch.send("world");
};

const thread2 = spawn func
{
    ch.send("hello");
    print ch.receive();
};
