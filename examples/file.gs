const io = global.io;
const time = global.time;

const filename = "dub.json";
if io.fileExists(filename)
{
    const input = io.readFile(filename);
    
    const t = time.datetime(io.fileModificationTime(filename));
    
    io.writeln("Year: ", t.year);
    io.writeln("Month: ", t.month);
    io.writeln("Day: ", t.day);
    io.writeln("Time: ", t.hour, ":", t.minute, ":", t.second);
}
