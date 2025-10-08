func threadFunc(self, index)
{
    let x = 0;
    while(x < 10)
    {
        x += 1;
    }
    print index;
}

// Spawn 1000000 threads in batches by 100
let i = 0;
let bi = 0;
let t;
let batch = array(1000000);
while(i < 1000000)
{
    print i;
    bi = 0;
    print "batch start";
    while(bi < 100)
    {
        batch[bi] = spawn(null, i) threadFunc;
        i += 1;
        bi += 1;
    }
    
    bi = 0;
    while(bi < 100)
    {
        await batch[bi];
        batch[bi].release();
        bi += 1;
    }
}
