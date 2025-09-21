func test1
{
    print $0;
    print $1;
    print $2;
}

func test2
{
    const args = $$;
    print args.length;
    args[0] = 100;
    print $$; // first argument is now 100
}

test1(5, 10, 20);
test2(5, 10, 20);
