module main;

import std.stdio;
import std.file;
import std.array;
import std.string;
import std.conv;
import std.bitmanip;

void main(string[] args)
{
    if (args.length != 4)
    {
        writeln("Usage: gslink <interpreter.exe> <bytecode.gsc> <output.exe>");
        return;
    }

    string interpreterPath = args[1];
    string bytecodePath    = args[2];
    string outputPath      = args[3];

    try
    {
        ubyte[] interpreterData = cast(ubyte[])std.file.read(interpreterPath);
        ubyte[] bytecodeData    = cast(ubyte[])std.file.read(bytecodePath);
        ubyte[4] codeSize;
        codeSize[] = nativeToLittleEndian(cast(uint)bytecodeData.length)[0..4];
        
        ubyte[] packedData = interpreterData ~ bytecodeData ~ cast(ubyte[])"MAIN" ~ codeSize;
        std.file.write(outputPath, packedData);
        
        writeln("Packed ", interpreterPath, " + ", bytecodePath, " -> ", outputPath);
    }
    catch (Exception e)
    {
        writeln("Error: ", e.msg);
    }
}
