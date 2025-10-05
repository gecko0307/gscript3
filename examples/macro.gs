macro PI = 3.14159;
macro PI2 = PI * 2;
print PI2;

macro test = (x < 10);

let x = 0;
while (test)
{
    print x;
    x += 1;
}
