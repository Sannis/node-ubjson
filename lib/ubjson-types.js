/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

// UBJSON value types markers
var types = {};

// General types
types.NULL = 'Z';

// Boolean types
types.TRUE = 'T';
types.FALSE = 'F';

// Fixed-point numeric types
types.BYTE  = 'B';
types.INT16 = 'i';
types.INT32 = 'I';
types.INT64 = 'L';

// Float-point numeric types
types.FLOAT = 'd';
types.DOUBLE = 'D';

// Numeric type for huge numbers
// Useful for 64-bit integers and more
types.SHORTHUGE = 'h';
types.HUGE = 'H';

// String types
types.SHORTSTRING = 's';
types.STRING = 'S';

// Array types
types.SHORTARRAY = 'a';
types.ARRAY = 'A';

// Object types
types.SHORTOBJECT = 'o';
types.OBJECT = 'O';

// End marker for unknown-length containers (both arrays and objects)
types.END = 'E';

// The No-Op value stands for "No Operation"
// Should be quietly skipped by parser
types.NOOP = 'N';

// Prepare types hash to use
var typesKeys = Object.getOwnPropertyNames(types);
typesKeys.forEach(function(typeKey) {
  types[typeKey] = types[typeKey].charCodeAt(0);
});

// Export
module.exports = types;
