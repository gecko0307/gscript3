func test
{
    const args = $$;
    print args.length;
    args[0] = 100;
    print $$;
}

test(5, 10, 20);

