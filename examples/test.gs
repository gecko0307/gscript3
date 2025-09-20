import "foo.gs" as Foo;

const f = new Foo;
Foo.prop = 10;
f.test();

f.prop = 5;
f.test();

Foo.test();
