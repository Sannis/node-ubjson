/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

// Require dependencies
var strtok = require('strtok');

// Require UBJSON types definition
var ubjsonTypes = require("./ubjson-types.js");

/** internal
 * class UbjsonParser
 *
 * Generator function for handing to strtok.parse(); takes an accumulator
 * callback to invoke when a top-level type is read from the stream.
 **/

/** internal
 * new UbjsonParser(acc)
 * - acc (Function): Accumulator callback from `strtok`
 *
 * [[UbjsonParser]] constructor.
 **/
function UbjsonParser(acc) {
  // Type that we're in when reading a value
  var type; // === undefined;

  // Special type for string parsing
  var STRINGEND = -1;

  // We should stop stream parsing if top-level acc() get error in argument
  var doneParsing = false;
  var topLevelAcc = acc;
  acc = function (value) {
    if (value instanceof Error) {
      doneParsing = true;
    }

    topLevelAcc(value);
  };

  // Return a function for unpacking an array
  var unpackArray = function(nvals, oldAcc) {
    var arr = [];

    if (nvals === 0) {
      acc(arr);
      return oldAcc;
    }

    return function(v) {
      // Malformed array with error in value parsing
      // see:  https://github.com/Sannis/node-ubjson/issues/23
      // test: UnpackMalformedArrayWithImpossibleElement
      if (v instanceof Error) {
        // Add partially collected data
        if (typeof v.collectedData !== 'undefined') {
          arr.push(v.collectedData);
        }
        // Create error object
        v = new Error(
          'Malformed array. Error in value parsing. ' +
          'Collected array data: ' + JSON.stringify(arr)
        );
        // Store partially collected data in error object
        v.collectedData = arr;
        // Go up in call stack
        acc = oldAcc;
        acc(v);
        return;
      }

      arr.push(v);

      if (arr.length >= nvals) {
        acc = oldAcc;
        acc(arr);
      }
    };
  };

  // Return a function for unpacking an unknown-length array
  var unpackUnknownLengthArray = function(oldAcc) {
    var arr = [];

    return function(v, isEnd) {
      if (!isEnd) {
        // Malformed array with error in value parsing
        // see:  https://github.com/Sannis/node-ubjson/issues/23
        // test: UnpackMalformedUnknownLengthArrayWithImpossibleElement
        if (v instanceof Error) {
          // Add partially collected data
          if (typeof v.collectedData !== 'undefined') {
            arr.push(v.collectedData);
          }
          // Create error object
          v = new Error(
            'Malformed array. Error in value parsing. ' +
            'Collected array data: ' + JSON.stringify(arr)
          );
          // Store partially collected data in error object
          v.collectedData = arr;
          // Go up in call stack
          acc = oldAcc;
          acc(v);
          return;
        }

        arr.push(v);
      } else {
        acc = oldAcc;
        acc(arr);
      }
    };
  };

  // Return a function for unpacking an object
  var unpackObject = function(nvals, oldAcc) {
    var obj = {};
    var k; // === undefined;
    var numKeys = 0;

    if (nvals === 0) {
      acc(obj);
      return oldAcc;
    }

    return function(v) {
      if (k === undefined) {
        // Malformed object with Array as key
        // see:  https://github.com/Sannis/node-ubjson/issues/21
        // test: UnpackMalformedObjectWithArrayKey
        if (Array.isArray(v)) {
          // Create error object
          v = new Error(
            'Malformed object. Key must not be an Array. ' +
            'Collected object data: ' + JSON.stringify(obj)
          );
          // Store partially collected data in error object
          v.collectedData = obj;
          // Go up in call stack
          acc = oldAcc;
          acc(v);
          return;
        }

        // Malformed object with Object as key
        // see:  https://github.com/Sannis/node-ubjson/issues/21
        // test: UnpackMalformedObjectWithObjectKey
        if (v.constructor === Object) {
          // Create error object
          v = new Error(
            'Malformed object. Key must not be an Object. ' +
            'Collected object data: ' + JSON.stringify(obj)
          );
          // Store partially collected data in error object
          v.collectedData = obj;
          // Go up in call stack
          acc = oldAcc;
          acc(v);
          return;
        }

        // Malformed object with error in key parsing
        // see:  https://github.com/Sannis/node-ubjson/issues/22
        // test: UnpackMalformedObjectWithImpossibleKey
        if (v instanceof Error) {
          // Create error object
          v = new Error(
            'Malformed object. Error in key parsing. ' +
            'Collected object data: ' + JSON.stringify(obj)
          );
          // Store partially collected data in error object
          v.collectedData = obj;
          // Go up in call stack
          acc = oldAcc;
          acc(v);
          return;
        }

        k = v;
        return;
      }

      // Malformed object with error in value parsing
      // see:  https://github.com/Sannis/node-ubjson/issues/23
      // test: UnpackMalformedObjectWithImpossibleValue
      if (v instanceof Error) {
        // Add partially collected data
        obj[k] = v.collectedData;
        // Create error object
        v = new Error(
          'Malformed object. Bad value for key "' + k + '". ' +
          'Collected object data: ' + JSON.stringify(obj)
        );
        // Store partially collected data in error object
        v.collectedData = obj;
        // Go up in call stack
        acc = oldAcc;
        acc(v);
        return;
      }

      obj[k] = v;
      k = undefined;

      numKeys += 1;

      if (numKeys === nvals) {
        acc = oldAcc;
        acc(obj);
      }
    };
  };

  // Return a function for unpacking an unknown-length object
  var unpackUnknownLengthObject = function(oldAcc) {
    var obj = {};
    var k; // === undefined;

    return function(v, isEnd) {
      if (!isEnd) {
        if (k === undefined) {
          // Malformed object with Array as key
          // see:  https://github.com/Sannis/node-ubjson/issues/21
          // test: UnpackMalformedUnknownLengthObjectWithArrayKey
          if (Array.isArray(v)) {
            // Create error object
            v = new Error(
              'Malformed object. Key must not be an Array. ' +
              'Collected object data: ' + JSON.stringify(obj)
            );
            // Store partially collected data in error object
            v.collectedData = obj;
            // Go up in call stack
            acc = oldAcc;
            acc(v);
            return;
          }

          // Malformed object with Object as key
          // see:  https://github.com/Sannis/node-ubjson/issues/21
          // test: UnpackMalformedUnknownLengthObjectWithObjectKey
          if (v.constructor === Object) {
            // Create error object
            v = new Error(
              'Malformed object. Key must not be an Object. ' +
              'Collected object data: ' + JSON.stringify(obj)
            );
            // Store partially collected data in error object
            v.collectedData = obj;
            // Go up in call stack
            acc = oldAcc;
            acc(v);
            return;
          }

          // Malformed object with error in key parsing
          // see:  https://github.com/Sannis/node-ubjson/issues/22
          // test: UnpackMalformedUnknownLengthObjectWithImpossibleKey
          if (v instanceof Error) {
            // Create error object
            v = new Error(
              'Malformed object. Error in key parsing. ' +
              'Collected object data: ' + JSON.stringify(obj)
            );
            // Store partially collected data in error object
            v.collectedData = obj;
            // Go up in call stack
            acc = oldAcc;
            acc(v);
            return;
          }

          k = v;
          return;
        }

        // Malformed object with error in value parsing
        // see:  https://github.com/Sannis/node-ubjson/issues/14
        // test: UnpackMalformedUnknownLengthObjectWithImpossibleValue
        if (v instanceof Error) {
          // Add partially collected data
          obj[k] = v.collectedData;
          // Create error object
          v = new Error(
            'Malformed object. Bad value for key "' + k + '". ' +
            'Collected object data: ' + JSON.stringify(obj)
          );
          // Store partially collected data in error object
          v.collectedData = obj;
          // Go up in call stack
          acc = oldAcc;
          acc(v);
          return;
        }

        obj[k] = v;
        k = undefined;
      } else {
        // Malformed object without last value
        // see:  https://github.com/Sannis/node-ubjson/issues/14
        // test: UnpackMalformedUnknownLengthObject
        if (k !== undefined) {
          // Add partially collected data
          // TODO: Consider is this useful, see #26
          //obj[k] = null;
          // Create error object
          var err = new Error(
            'Malformed unknown-length object. No value for key "' + k + '".' +
            'Collected object data: ' + JSON.stringify(obj)
          );
          // Store partially collected data in error object
          err.collectedData = obj;
          // err -> obj
          obj = err;
        }

        // Go up in call stack
        acc = oldAcc;
        acc(obj);
      }
    };
  };


  // Parse a single value, calling acc() as values are accumulated
  return function(v) {
    if (doneParsing === true) {
        return strtok.DONE;
    }

    if (v === undefined) {
        return strtok.UINT8;
    }

    switch (type) {
      case undefined:
        // We're reading the first byte of our type. Either we have a
        // single-byte primitive (we accumulate now), a multi-byte
        // primitive (we set our type and accumulate when we've
        // finished reading the primitive from the stream), or we have a
        // complex type.

        // No-Op
        if (v === ubjsonTypes.NOOP) {
          // Should be quietly skipped by parser
          break;
        }

        // null/undefined
        if (v === ubjsonTypes.NULL) {
          acc(null);
          break;
        }

        // true
        if (v === ubjsonTypes.TRUE) {
          acc(true);
          break;
        }

        // false
        if (v === ubjsonTypes.FALSE) {
          acc(false);
          break;
        }

        // byte
        if (v === ubjsonTypes.BYTE) {
          type = ubjsonTypes.BYTE;
          return strtok.INT8;
        }

        // int16
        if (v === ubjsonTypes.INT16) {
          type = ubjsonTypes.INT16;
          return strtok.INT16_BE;
        }

        // int32
        if (v === ubjsonTypes.INT32) {
          type = ubjsonTypes.INT32;
          return strtok.INT32_BE;
        }

        // int64
        if (v === ubjsonTypes.INT64) {
          type = ubjsonTypes.INT64;
          return strtok.INT64_BE;
        }

        // float
        if (v === ubjsonTypes.FLOAT) {
          type = ubjsonTypes.FLOAT;
          return strtok.FLOAT_BE;
        }

        // double
        if (v === ubjsonTypes.DOUBLE) {
          type = ubjsonTypes.DOUBLE;
          return strtok.DOUBLE_BE;
        }

        // short huge number
        if (v === ubjsonTypes.SHORTHUGE) {
          type = ubjsonTypes.SHORTHUGE;
          return strtok.UINT8;
        }

        // huge number
        if (v === ubjsonTypes.HUGE) {
          type = ubjsonTypes.HUGE;
          return strtok.UINT32_BE;
        }

        // short string
        if (v === ubjsonTypes.SHORTSTRING) {
          type = ubjsonTypes.SHORTSTRING;
          return strtok.UINT8;
        }

        // string
        if (v === ubjsonTypes.STRING) {
          type = ubjsonTypes.STRING;
          return strtok.UINT32_BE;
        }

        // short array
        if (v === ubjsonTypes.SHORTARRAY) {
          type = ubjsonTypes.SHORTARRAY;
          return strtok.UINT8;
        }

        // array
        if (v === ubjsonTypes.ARRAY) {
          type = ubjsonTypes.ARRAY;
          return strtok.UINT32_BE;
        }

        // short object
        if (v === ubjsonTypes.SHORTOBJECT) {
          type = ubjsonTypes.SHORTOBJECT;
          return strtok.UINT8;
        }

        // object
        if (v === ubjsonTypes.OBJECT) {
          type = ubjsonTypes.OBJECT;
          return strtok.UINT32_BE;
        }

        // unknown-length container end
        if (v === ubjsonTypes.END) {
          acc(null, true);
          break;
        }

        // Unknown type
        // - return Error
        // - finish parsing
        acc(new Error("Cannot parse unknown type marker '" + v + "' (decimal)"));
        return strtok.DONE;

      case ubjsonTypes.BYTE:
      case ubjsonTypes.INT16:
      case ubjsonTypes.INT32:
      case ubjsonTypes.INT64:
      case ubjsonTypes.FLOAT:
      case ubjsonTypes.DOUBLE:
        acc(v);
        type = undefined;
        break;

      case ubjsonTypes.SHORTHUGE:
      case ubjsonTypes.HUGE:
        type = STRINGEND;
        return new strtok.StringType(v, 'utf-8');

      case ubjsonTypes.SHORTSTRING:
      case ubjsonTypes.STRING:
        type = STRINGEND;
        return new strtok.StringType(v, 'utf-8');

      case STRINGEND:
        acc(v.toString());
        type = undefined;
        break;

      case ubjsonTypes.SHORTARRAY:
        if (v === 255) {
          acc = unpackUnknownLengthArray(acc);
        } else {
          acc = unpackArray(v, acc);
        }
        type = undefined;
        break;

      case ubjsonTypes.ARRAY:
        acc = unpackArray(v, acc);
        type = undefined;
        break;

      case ubjsonTypes.SHORTOBJECT:
        if (v === 255) {
          acc = unpackUnknownLengthObject(acc);
        } else {
          acc = unpackObject(v, acc);
        }
        type = undefined;
        break;

      case ubjsonTypes.OBJECT:
        acc = unpackObject(v, acc);
        type = undefined;
        break;
    }

    // We're reading a new primitive; go get it
    return strtok.UINT8;
  };
}

// Export parser
module.exports = UbjsonParser;
