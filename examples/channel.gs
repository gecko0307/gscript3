const ch = global.channel();

const thread1 = spawn func
{
    print ch.receive();
    print ch.receive();
};

const thread2 = spawn func
{
    ch.send("hello");
    ch.send("world");
};
