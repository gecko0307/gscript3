module gscript.dynamic;

import std.traits;
import std.conv;

import gscript.vm;

enum GsDynamicType: uint
{
    Undefined = 0,
    Number = 1,
    String = 2,
    Array = 3,
    Object = 4,
    NativeMethod = 5,
    NativeFunction = 6
    // Function = 7
}

alias GsNativeMethod = GsDynamic delegate(GsDynamic[]);
alias GsNativeFunc = GsDynamic function(GsDynamic[]);

struct GsDynamic
{
    union
    {
        double asNumber;
        GsObject asObject;
        GsNativeMethod asNativeMethod;
        GsNativeFunc asNativeFunction;
        GsDynamic[] asArray;
        string asString;
    }
    
    GsDynamicType type;
    uint payload;
    
    this(T)(T value)
    {
        static if (isBoolean!T)
        {
            asNumber = value;
            type = GsDynamicType.Number;
        }
        else static if (isNumeric!T)
        {
            asNumber = value;
            type = GsDynamicType.Number;
        }
        else static if (is(T : GsObject))
        {
            asObject = value;
            type = GsDynamicType.Object;
        }
        else static if (is(T == GsDynamic[]))
        {
            asArray = value;
            type = GsDynamicType.Array;
        }
        else static if (is(T == string))
        {
            asString = value;
            type = GsDynamicType.String;
        }
        else static if (isDelegate!T)
        {
            asNativeMethod = value;
            type = GsDynamicType.NativeMethod;
        }
        else static if (isFunctionPointer!T)
        {
            asNativeFunction = value;
            type = GsDynamicType.NativeFunction;
        }
        else static assert("Unsupported type for GsDynamic: " ~ T.stringof);
    }
    
    string toString()
    {
        switch(type)
        {
            case GsDynamicType.Undefined:
                return "undefined";
            case GsDynamicType.Number:
                return asNumber.to!string;
            case GsDynamicType.String:
                return asString;
            case GsDynamicType.Array:
                return asArray.to!string;
            case GsDynamicType.Object:
                return asObject.to!string;
            default:
                return "undefined";
        }
    }
}
