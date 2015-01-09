
// instrument by jscoverage, do not modifly this file
(function (file, lines, conds, source) {
  var BASE;
  if (typeof global === 'object') {
    BASE = global;
  } else if (typeof window === 'object') {
    BASE = window;
  } else {
    throw new Error('[jscoverage] unknow ENV!');
  }
  if (BASE._$jscoverage) {
    BASE._$jscmd(file, 'init', lines, conds, source);
    return;
  }
  var cov = {};
  /**
   * jsc(file, 'init', lines, condtions)
   * jsc(file, 'line', lineNum)
   * jsc(file, 'cond', lineNum, expr, start, offset)
   */
  function jscmd(file, type, line, express, start, offset) {
    var storage;
    switch (type) {
      case 'init':
        if(cov[file]){
          storage = cov[file];
        } else {
          storage = [];
          for (var i = 0; i < line.length; i ++) {
            storage[line[i]] = 0;
          }
          var condition = express;
          var source = start;
          storage.condition = condition;
          storage.source = source;
        }
        cov[file] = storage;
        break;
      case 'line':
        storage = cov[file];
        storage[line] ++;
        break;
      case 'cond':
        storage = cov[file];
        storage.condition[line] ++;
        return express;
    }
  }

  BASE._$jscoverage = cov;
  BASE._$jscmd = jscmd;
  jscmd(file, 'init', lines, conds, source);
})('lib/ubjson-types.js', [8,11,14,15,18,19,20,21,24,25,29,30,33,34,37,38,41,42,45,49,52,53,58,54], {}, ["/*!"," * Copyright by Oleg Efimov"," *"," * See license text in LICENSE file"," */","","// UBJSON value types markers","var types = {};","","// General types","types.NULL = 'Z';","","// Boolean types","types.TRUE = 'T';","types.FALSE = 'F';","","// Fixed-point numeric types","types.BYTE  = 'B';","types.INT16 = 'i';","types.INT32 = 'I';","types.INT64 = 'L';","","// Float-point numeric types","types.FLOAT = 'd';","types.DOUBLE = 'D';","","// Numeric type for huge numbers","// Useful for 64-bit integers and more","types.SHORTHUGE = 'h';","types.HUGE = 'H';","","// String types","types.SHORTSTRING = 's';","types.STRING = 'S';","","// Array types","types.SHORTARRAY = 'a';","types.ARRAY = 'A';","","// Object types","types.SHORTOBJECT = 'o';","types.OBJECT = 'O';","","// End marker for unknown-length containers (both arrays and objects)","types.END = 'E';","","// The No-Op value stands for \"No Operation\"","// Should be quietly skipped by parser","types.NOOP = 'N';","","// Prepare types hash to use","var typesKeys = Object.getOwnPropertyNames(types);","typesKeys.forEach(function(typeKey) {","  types[typeKey] = types[typeKey].charCodeAt(0);","});","","// Export","module.exports = types;",""]);
/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */
// UBJSON value types markers
_$jscmd("lib/ubjson-types.js", "line", 8);

var types = {};

_$jscmd("lib/ubjson-types.js", "line", 11);

// General types
types.NULL = "Z";

_$jscmd("lib/ubjson-types.js", "line", 14);

// Boolean types
types.TRUE = "T";

_$jscmd("lib/ubjson-types.js", "line", 15);

types.FALSE = "F";

_$jscmd("lib/ubjson-types.js", "line", 18);

// Fixed-point numeric types
types.BYTE = "B";

_$jscmd("lib/ubjson-types.js", "line", 19);

types.INT16 = "i";

_$jscmd("lib/ubjson-types.js", "line", 20);

types.INT32 = "I";

_$jscmd("lib/ubjson-types.js", "line", 21);

types.INT64 = "L";

_$jscmd("lib/ubjson-types.js", "line", 24);

// Float-point numeric types
types.FLOAT = "d";

_$jscmd("lib/ubjson-types.js", "line", 25);

types.DOUBLE = "D";

_$jscmd("lib/ubjson-types.js", "line", 29);

// Numeric type for huge numbers
// Useful for 64-bit integers and more
types.SHORTHUGE = "h";

_$jscmd("lib/ubjson-types.js", "line", 30);

types.HUGE = "H";

_$jscmd("lib/ubjson-types.js", "line", 33);

// String types
types.SHORTSTRING = "s";

_$jscmd("lib/ubjson-types.js", "line", 34);

types.STRING = "S";

_$jscmd("lib/ubjson-types.js", "line", 37);

// Array types
types.SHORTARRAY = "a";

_$jscmd("lib/ubjson-types.js", "line", 38);

types.ARRAY = "A";

_$jscmd("lib/ubjson-types.js", "line", 41);

// Object types
types.SHORTOBJECT = "o";

_$jscmd("lib/ubjson-types.js", "line", 42);

types.OBJECT = "O";

_$jscmd("lib/ubjson-types.js", "line", 45);

// End marker for unknown-length containers (both arrays and objects)
types.END = "E";

_$jscmd("lib/ubjson-types.js", "line", 49);

// The No-Op value stands for "No Operation"
// Should be quietly skipped by parser
types.NOOP = "N";

_$jscmd("lib/ubjson-types.js", "line", 52);

// Prepare types hash to use
var typesKeys = Object.getOwnPropertyNames(types);

_$jscmd("lib/ubjson-types.js", "line", 53);

typesKeys.forEach(function(typeKey) {
    _$jscmd("lib/ubjson-types.js", "line", 54);
    types[typeKey] = types[typeKey].charCodeAt(0);
});

_$jscmd("lib/ubjson-types.js", "line", 58);

// Export
module.exports = types;