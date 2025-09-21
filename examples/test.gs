const Obj = {
    prop: "bar",
    test: func(self)
    {
        print self.prop;
    }
};

const f = new Obj;

Obj.prop = 10;   // property is changed in the prototype
f.test();        // prints 10 (inherited from prototype)

f.prop = 5;
f.test();        // prints 5 (now overrides prototype property)
