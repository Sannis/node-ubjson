
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
})('lib/ubjson-parser.js', [8,11,527,28,31,34,35,36,45,85,120,219,330,41,38,46,53,49,50,75,63,68,70,71,72,60,78,79,86,88,111,99,104,106,107,108,96,113,114,121,122,123,130,126,127,206,207,209,183,184,137,142,144,145,146,154,159,161,162,163,171,176,178,179,180,192,194,199,201,202,203,212,213,220,221,223,300,301,277,278,231,236,238,239,240,248,253,255,256,257,265,270,272,273,274,286,288,293,295,296,297,322,323,311,316,318,522,332,336,464,465,350,355,356,361,362,367,368,373,374,379,380,385,386,391,392,397,398,403,404,409,410,415,416,421,422,427,428,433,434,439,440,445,446,451,452,457,458,473,474,475,479,480,484,485,488,489,490,498,499,494,496,502,503,504,512,513,508,510,516,517,518], {"37_8_22":0,"48_8_11":0,"57_10_18":0,"59_12_38":0,"77_10_19":0,"89_10_6":0,"93_12_18":0,"95_14_38":0,"125_8_11":0,"131_10_15":0,"135_12_16":0,"152_12_24":0,"169_12_18":0,"190_10_18":0,"211_10_17":0,"224_10_6":0,"225_12_15":0,"229_14_16":0,"246_14_24":0,"263_14_18":0,"284_12_18":0,"306_12_15":0,"331_8_20":0,"335_8_15":0,"348_12_22":0,"354_12_22":0,"360_12_22":0,"366_12_23":0,"372_12_22":0,"378_12_23":0,"384_12_23":0,"390_12_23":0,"396_12_23":0,"402_12_24":0,"408_12_27":0,"414_12_22":0,"420_12_29":0,"426_12_24":0,"432_12_28":0,"438_12_23":0,"444_12_29":0,"450_12_24":0,"456_12_21":0,"493_12_9":0,"507_12_9":0}, ["/*!"," * Copyright by Oleg Efimov"," *"," * See license text in LICENSE file"," */","","// Require dependencies","var strtok = require('strtok');","","// Require UBJSON types definition","var ubjsonTypes = require(\"./ubjson-types.js\");","","/** internal"," * class UbjsonParser"," *"," * Generator function for handing to strtok.parse(); takes an accumulator"," * callback to invoke when a top-level type is read from the stream."," **/","","/** internal"," * new UbjsonParser(acc)"," * - acc (Function): Accumulator callback from `strtok`"," *"," * [[UbjsonParser]] constructor."," **/","function UbjsonParser(acc) {","  // Type that we're in when reading a value","  var type; // === undefined;","","  // Special type for string parsing","  var STRINGEND = -1;","","  // We should stop stream parsing if top-level acc() get error in argument","  var doneParsing = false;","  var topLevelAcc = acc;","  acc = function (value) {","    if (value instanceof Error) {","      doneParsing = true;","    }","","    topLevelAcc(value);","  };","","  // Return a function for unpacking an array","  var unpackArray = function(nvals, oldAcc) {","    var arr = [];","","    if (nvals === 0) {","      acc(arr);","      return oldAcc;","    }","","    return function(v) {","      // Malformed array with error in value parsing","      // see:  https://github.com/Sannis/node-ubjson/issues/23","      // test: UnpackMalformedArrayWithImpossibleElement","      if (v instanceof Error) {","        // Add partially collected data","        if (typeof v.collectedData !== 'undefined') {","          arr.push(v.collectedData);","        }","        // Create error object","        v = new Error(","          'Malformed array. Error in value parsing. ' +","          'Collected array data: ' + JSON.stringify(arr)","        );","        // Store partially collected data in error object","        v.collectedData = arr;","        // Go up in call stack","        acc = oldAcc;","        acc(v);","        return;","      }","","      arr.push(v);","","      if (arr.length >= nvals) {","        acc = oldAcc;","        acc(arr);","      }","    };","  };","","  // Return a function for unpacking an unknown-length array","  var unpackUnknownLengthArray = function(oldAcc) {","    var arr = [];","","    return function(v, isEnd) {","      if (!isEnd) {","        // Malformed array with error in value parsing","        // see:  https://github.com/Sannis/node-ubjson/issues/23","        // test: UnpackMalformedUnknownLengthArrayWithImpossibleElement","        if (v instanceof Error) {","          // Add partially collected data","          if (typeof v.collectedData !== 'undefined') {","            arr.push(v.collectedData);","          }","          // Create error object","          v = new Error(","            'Malformed array. Error in value parsing. ' +","            'Collected array data: ' + JSON.stringify(arr)","          );","          // Store partially collected data in error object","          v.collectedData = arr;","          // Go up in call stack","          acc = oldAcc;","          acc(v);","          return;","        }","","        arr.push(v);","      } else {","        acc = oldAcc;","        acc(arr);","      }","    };","  };","","  // Return a function for unpacking an object","  var unpackObject = function(nvals, oldAcc) {","    var obj = {};","    var k; // === undefined;","    var numKeys = 0;","","    if (nvals === 0) {","      acc(obj);","      return oldAcc;","    }","","    return function(v) {","      if (k === undefined) {","        // Malformed object with Array as key","        // see:  https://github.com/Sannis/node-ubjson/issues/21","        // test: UnpackMalformedObjectWithArrayKey","        if (Array.isArray(v)) {","          // Create error object","          v = new Error(","            'Malformed object. Key must not be an Array. ' +","            'Collected object data: ' + JSON.stringify(obj)","          );","          // Store partially collected data in error object","          v.collectedData = obj;","          // Go up in call stack","          acc = oldAcc;","          acc(v);","          return;","        }","","        // Malformed object with Object as key","        // see:  https://github.com/Sannis/node-ubjson/issues/21","        // test: UnpackMalformedObjectWithObjectKey","        if (v.constructor === Object) {","          // Create error object","          v = new Error(","            'Malformed object. Key must not be an Object. ' +","            'Collected object data: ' + JSON.stringify(obj)","          );","          // Store partially collected data in error object","          v.collectedData = obj;","          // Go up in call stack","          acc = oldAcc;","          acc(v);","          return;","        }","","        // Malformed object with error in key parsing","        // see:  https://github.com/Sannis/node-ubjson/issues/22","        // test: UnpackMalformedObjectWithImpossibleKey","        if (v instanceof Error) {","          // Create error object","          v = new Error(","            'Malformed object. Error in key parsing. ' +","            'Collected object data: ' + JSON.stringify(obj)","          );","          // Store partially collected data in error object","          v.collectedData = obj;","          // Go up in call stack","          acc = oldAcc;","          acc(v);","          return;","        }","","        k = v;","        return;","      }","","      // Malformed object with error in value parsing","      // see:  https://github.com/Sannis/node-ubjson/issues/23","      // test: UnpackMalformedObjectWithImpossibleValue","      if (v instanceof Error) {","        // Add partially collected data","        obj[k] = v.collectedData;","        // Create error object","        v = new Error(","          'Malformed object. Bad value for key \"' + k + '\". ' +","          'Collected object data: ' + JSON.stringify(obj)","        );","        // Store partially collected data in error object","        v.collectedData = obj;","        // Go up in call stack","        acc = oldAcc;","        acc(v);","        return;","      }","","      obj[k] = v;","      k = undefined;","","      numKeys += 1;","","      if (numKeys === nvals) {","        acc = oldAcc;","        acc(obj);","      }","    };","  };","","  // Return a function for unpacking an unknown-length object","  var unpackUnknownLengthObject = function(oldAcc) {","    var obj = {};","    var k; // === undefined;","","    return function(v, isEnd) {","      if (!isEnd) {","        if (k === undefined) {","          // Malformed object with Array as key","          // see:  https://github.com/Sannis/node-ubjson/issues/21","          // test: UnpackMalformedUnknownLengthObjectWithArrayKey","          if (Array.isArray(v)) {","            // Create error object","            v = new Error(","              'Malformed object. Key must not be an Array. ' +","              'Collected object data: ' + JSON.stringify(obj)","            );","            // Store partially collected data in error object","            v.collectedData = obj;","            // Go up in call stack","            acc = oldAcc;","            acc(v);","            return;","          }","","          // Malformed object with Object as key","          // see:  https://github.com/Sannis/node-ubjson/issues/21","          // test: UnpackMalformedUnknownLengthObjectWithObjectKey","          if (v.constructor === Object) {","            // Create error object","            v = new Error(","              'Malformed object. Key must not be an Object. ' +","              'Collected object data: ' + JSON.stringify(obj)","            );","            // Store partially collected data in error object","            v.collectedData = obj;","            // Go up in call stack","            acc = oldAcc;","            acc(v);","            return;","          }","","          // Malformed object with error in key parsing","          // see:  https://github.com/Sannis/node-ubjson/issues/22","          // test: UnpackMalformedUnknownLengthObjectWithImpossibleKey","          if (v instanceof Error) {","            // Create error object","            v = new Error(","              'Malformed object. Error in key parsing. ' +","              'Collected object data: ' + JSON.stringify(obj)","            );","            // Store partially collected data in error object","            v.collectedData = obj;","            // Go up in call stack","            acc = oldAcc;","            acc(v);","            return;","          }","","          k = v;","          return;","        }","","        // Malformed object with error in value parsing","        // see:  https://github.com/Sannis/node-ubjson/issues/14","        // test: UnpackMalformedUnknownLengthObjectWithImpossibleValue","        if (v instanceof Error) {","          // Add partially collected data","          obj[k] = v.collectedData;","          // Create error object","          v = new Error(","            'Malformed object. Bad value for key \"' + k + '\". ' +","            'Collected object data: ' + JSON.stringify(obj)","          );","          // Store partially collected data in error object","          v.collectedData = obj;","          // Go up in call stack","          acc = oldAcc;","          acc(v);","          return;","        }","","        obj[k] = v;","        k = undefined;","      } else {","        // Malformed object without last value","        // see:  https://github.com/Sannis/node-ubjson/issues/14","        // test: UnpackMalformedUnknownLengthObject","        if (k !== undefined) {","          // Add partially collected data","          // TODO: Consider is this useful, see #26","          //obj[k] = null;","          // Create error object","          var err = new Error(","            'Malformed unknown-length object. No value for key \"' + k + '\".' +","            'Collected object data: ' + JSON.stringify(obj)","          );","          // Store partially collected data in error object","          err.collectedData = obj;","          // err -> obj","          obj = err;","        }","","        // Go up in call stack","        acc = oldAcc;","        acc(obj);","      }","    };","  };","","","  // Parse a single value, calling acc() as values are accumulated","  return function(v) {","    if (doneParsing === true) {","        return strtok.DONE;","    }","","    if (v === undefined) {","        return strtok.UINT8;","    }","","    switch (type) {","      case undefined:","        // We're reading the first byte of our type. Either we have a","        // single-byte primitive (we accumulate now), a multi-byte","        // primitive (we set our type and accumulate when we've","        // finished reading the primitive from the stream), or we have a","        // complex type.","","        // No-Op","        if (v === ubjsonTypes.NOOP) {","          // Should be quietly skipped by parser","          break;","        }","","        // null/undefined","        if (v === ubjsonTypes.NULL) {","          acc(null);","          break;","        }","","        // true","        if (v === ubjsonTypes.TRUE) {","          acc(true);","          break;","        }","","        // false","        if (v === ubjsonTypes.FALSE) {","          acc(false);","          break;","        }","","        // byte","        if (v === ubjsonTypes.BYTE) {","          type = ubjsonTypes.BYTE;","          return strtok.INT8;","        }","","        // int16","        if (v === ubjsonTypes.INT16) {","          type = ubjsonTypes.INT16;","          return strtok.INT16_BE;","        }","","        // int32","        if (v === ubjsonTypes.INT32) {","          type = ubjsonTypes.INT32;","          return strtok.INT32_BE;","        }","","        // int64","        if (v === ubjsonTypes.INT64) {","          type = ubjsonTypes.INT64;","          return strtok.INT64_BE;","        }","","        // float","        if (v === ubjsonTypes.FLOAT) {","          type = ubjsonTypes.FLOAT;","          return strtok.FLOAT_BE;","        }","","        // double","        if (v === ubjsonTypes.DOUBLE) {","          type = ubjsonTypes.DOUBLE;","          return strtok.DOUBLE_BE;","        }","","        // short huge number","        if (v === ubjsonTypes.SHORTHUGE) {","          type = ubjsonTypes.SHORTHUGE;","          return strtok.UINT8;","        }","","        // huge number","        if (v === ubjsonTypes.HUGE) {","          type = ubjsonTypes.HUGE;","          return strtok.UINT32_BE;","        }","","        // short string","        if (v === ubjsonTypes.SHORTSTRING) {","          type = ubjsonTypes.SHORTSTRING;","          return strtok.UINT8;","        }","","        // string","        if (v === ubjsonTypes.STRING) {","          type = ubjsonTypes.STRING;","          return strtok.UINT32_BE;","        }","","        // short array","        if (v === ubjsonTypes.SHORTARRAY) {","          type = ubjsonTypes.SHORTARRAY;","          return strtok.UINT8;","        }","","        // array","        if (v === ubjsonTypes.ARRAY) {","          type = ubjsonTypes.ARRAY;","          return strtok.UINT32_BE;","        }","","        // short object","        if (v === ubjsonTypes.SHORTOBJECT) {","          type = ubjsonTypes.SHORTOBJECT;","          return strtok.UINT8;","        }","","        // object","        if (v === ubjsonTypes.OBJECT) {","          type = ubjsonTypes.OBJECT;","          return strtok.UINT32_BE;","        }","","        // unknown-length container end","        if (v === ubjsonTypes.END) {","          acc(null, true);","          break;","        }","","        // Unknown type","        // - return Error","        // - finish parsing","        acc(new Error(\"Cannot parse unknown type marker '\" + v + \"' (decimal)\"));","        return strtok.DONE;","","      case ubjsonTypes.BYTE:","      case ubjsonTypes.INT16:","      case ubjsonTypes.INT32:","      case ubjsonTypes.INT64:","      case ubjsonTypes.FLOAT:","      case ubjsonTypes.DOUBLE:","        acc(v);","        type = undefined;","        break;","","      case ubjsonTypes.SHORTHUGE:","      case ubjsonTypes.HUGE:","        type = STRINGEND;","        return new strtok.StringType(v, 'utf-8');","","      case ubjsonTypes.SHORTSTRING:","      case ubjsonTypes.STRING:","        type = STRINGEND;","        return new strtok.StringType(v, 'utf-8');","","      case STRINGEND:","        acc(v.toString());","        type = undefined;","        break;","","      case ubjsonTypes.SHORTARRAY:","        if (v === 255) {","          acc = unpackUnknownLengthArray(acc);","        } else {","          acc = unpackArray(v, acc);","        }","        type = undefined;","        break;","","      case ubjsonTypes.ARRAY:","        acc = unpackArray(v, acc);","        type = undefined;","        break;","","      case ubjsonTypes.SHORTOBJECT:","        if (v === 255) {","          acc = unpackUnknownLengthObject(acc);","        } else {","          acc = unpackObject(v, acc);","        }","        type = undefined;","        break;","","      case ubjsonTypes.OBJECT:","        acc = unpackObject(v, acc);","        type = undefined;","        break;","    }","","    // We're reading a new primitive; go get it","    return strtok.UINT8;","  };","}","","// Export parser","module.exports = UbjsonParser;",""]);
/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */
// Require dependencies
_$jscmd("lib/ubjson-parser.js", "line", 8);

var strtok = require("strtok");

_$jscmd("lib/ubjson-parser.js", "line", 11);

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
    _$jscmd("lib/ubjson-parser.js", "line", 28);
    // Type that we're in when reading a value
    var type;
    _$jscmd("lib/ubjson-parser.js", "line", 31);
    // === undefined;
    // Special type for string parsing
    var STRINGEND = -1;
    _$jscmd("lib/ubjson-parser.js", "line", 34);
    // We should stop stream parsing if top-level acc() get error in argument
    var doneParsing = false;
    _$jscmd("lib/ubjson-parser.js", "line", 35);
    var topLevelAcc = acc;
    _$jscmd("lib/ubjson-parser.js", "line", 36);
    acc = function(value) {
        if (_$jscmd("lib/ubjson-parser.js", "cond", "37_8_22", value instanceof Error)) {
            _$jscmd("lib/ubjson-parser.js", "line", 38);
            doneParsing = true;
        }
        _$jscmd("lib/ubjson-parser.js", "line", 41);
        topLevelAcc(value);
    };
    _$jscmd("lib/ubjson-parser.js", "line", 45);
    // Return a function for unpacking an array
    var unpackArray = function(nvals, oldAcc) {
        _$jscmd("lib/ubjson-parser.js", "line", 46);
        var arr = [];
        if (_$jscmd("lib/ubjson-parser.js", "cond", "48_8_11", nvals === 0)) {
            _$jscmd("lib/ubjson-parser.js", "line", 49);
            acc(arr);
            _$jscmd("lib/ubjson-parser.js", "line", 50);
            return oldAcc;
        }
        _$jscmd("lib/ubjson-parser.js", "line", 53);
        return function(v) {
            // Malformed array with error in value parsing
            // see:  https://github.com/Sannis/node-ubjson/issues/23
            // test: UnpackMalformedArrayWithImpossibleElement
            if (_$jscmd("lib/ubjson-parser.js", "cond", "57_10_18", v instanceof Error)) {
                // Add partially collected data
                if (_$jscmd("lib/ubjson-parser.js", "cond", "59_12_38", typeof v.collectedData !== "undefined")) {
                    _$jscmd("lib/ubjson-parser.js", "line", 60);
                    arr.push(v.collectedData);
                }
                _$jscmd("lib/ubjson-parser.js", "line", 63);
                // Create error object
                v = new Error("Malformed array. Error in value parsing. " + "Collected array data: " + JSON.stringify(arr));
                _$jscmd("lib/ubjson-parser.js", "line", 68);
                // Store partially collected data in error object
                v.collectedData = arr;
                _$jscmd("lib/ubjson-parser.js", "line", 70);
                // Go up in call stack
                acc = oldAcc;
                _$jscmd("lib/ubjson-parser.js", "line", 71);
                acc(v);
                _$jscmd("lib/ubjson-parser.js", "line", 72);
                return;
            }
            _$jscmd("lib/ubjson-parser.js", "line", 75);
            arr.push(v);
            if (_$jscmd("lib/ubjson-parser.js", "cond", "77_10_19", arr.length >= nvals)) {
                _$jscmd("lib/ubjson-parser.js", "line", 78);
                acc = oldAcc;
                _$jscmd("lib/ubjson-parser.js", "line", 79);
                acc(arr);
            }
        };
    };
    _$jscmd("lib/ubjson-parser.js", "line", 85);
    // Return a function for unpacking an unknown-length array
    var unpackUnknownLengthArray = function(oldAcc) {
        _$jscmd("lib/ubjson-parser.js", "line", 86);
        var arr = [];
        _$jscmd("lib/ubjson-parser.js", "line", 88);
        return function(v, isEnd) {
            if (_$jscmd("lib/ubjson-parser.js", "cond", "89_10_6", !isEnd)) {
                // Malformed array with error in value parsing
                // see:  https://github.com/Sannis/node-ubjson/issues/23
                // test: UnpackMalformedUnknownLengthArrayWithImpossibleElement
                if (_$jscmd("lib/ubjson-parser.js", "cond", "93_12_18", v instanceof Error)) {
                    // Add partially collected data
                    if (_$jscmd("lib/ubjson-parser.js", "cond", "95_14_38", typeof v.collectedData !== "undefined")) {
                        _$jscmd("lib/ubjson-parser.js", "line", 96);
                        arr.push(v.collectedData);
                    }
                    _$jscmd("lib/ubjson-parser.js", "line", 99);
                    // Create error object
                    v = new Error("Malformed array. Error in value parsing. " + "Collected array data: " + JSON.stringify(arr));
                    _$jscmd("lib/ubjson-parser.js", "line", 104);
                    // Store partially collected data in error object
                    v.collectedData = arr;
                    _$jscmd("lib/ubjson-parser.js", "line", 106);
                    // Go up in call stack
                    acc = oldAcc;
                    _$jscmd("lib/ubjson-parser.js", "line", 107);
                    acc(v);
                    _$jscmd("lib/ubjson-parser.js", "line", 108);
                    return;
                }
                _$jscmd("lib/ubjson-parser.js", "line", 111);
                arr.push(v);
            } else {
                _$jscmd("lib/ubjson-parser.js", "line", 113);
                acc = oldAcc;
                _$jscmd("lib/ubjson-parser.js", "line", 114);
                acc(arr);
            }
        };
    };
    _$jscmd("lib/ubjson-parser.js", "line", 120);
    // Return a function for unpacking an object
    var unpackObject = function(nvals, oldAcc) {
        _$jscmd("lib/ubjson-parser.js", "line", 121);
        var obj = {};
        _$jscmd("lib/ubjson-parser.js", "line", 122);
        var k;
        _$jscmd("lib/ubjson-parser.js", "line", 123);
        // === undefined;
        var numKeys = 0;
        if (_$jscmd("lib/ubjson-parser.js", "cond", "125_8_11", nvals === 0)) {
            _$jscmd("lib/ubjson-parser.js", "line", 126);
            acc(obj);
            _$jscmd("lib/ubjson-parser.js", "line", 127);
            return oldAcc;
        }
        _$jscmd("lib/ubjson-parser.js", "line", 130);
        return function(v) {
            if (_$jscmd("lib/ubjson-parser.js", "cond", "131_10_15", k === undefined)) {
                // Malformed object with Array as key
                // see:  https://github.com/Sannis/node-ubjson/issues/21
                // test: UnpackMalformedObjectWithArrayKey
                if (_$jscmd("lib/ubjson-parser.js", "cond", "135_12_16", Array.isArray(v))) {
                    _$jscmd("lib/ubjson-parser.js", "line", 137);
                    // Create error object
                    v = new Error("Malformed object. Key must not be an Array. " + "Collected object data: " + JSON.stringify(obj));
                    _$jscmd("lib/ubjson-parser.js", "line", 142);
                    // Store partially collected data in error object
                    v.collectedData = obj;
                    _$jscmd("lib/ubjson-parser.js", "line", 144);
                    // Go up in call stack
                    acc = oldAcc;
                    _$jscmd("lib/ubjson-parser.js", "line", 145);
                    acc(v);
                    _$jscmd("lib/ubjson-parser.js", "line", 146);
                    return;
                }
                // Malformed object with Object as key
                // see:  https://github.com/Sannis/node-ubjson/issues/21
                // test: UnpackMalformedObjectWithObjectKey
                if (_$jscmd("lib/ubjson-parser.js", "cond", "152_12_24", v.constructor === Object)) {
                    _$jscmd("lib/ubjson-parser.js", "line", 154);
                    // Create error object
                    v = new Error("Malformed object. Key must not be an Object. " + "Collected object data: " + JSON.stringify(obj));
                    _$jscmd("lib/ubjson-parser.js", "line", 159);
                    // Store partially collected data in error object
                    v.collectedData = obj;
                    _$jscmd("lib/ubjson-parser.js", "line", 161);
                    // Go up in call stack
                    acc = oldAcc;
                    _$jscmd("lib/ubjson-parser.js", "line", 162);
                    acc(v);
                    _$jscmd("lib/ubjson-parser.js", "line", 163);
                    return;
                }
                // Malformed object with error in key parsing
                // see:  https://github.com/Sannis/node-ubjson/issues/22
                // test: UnpackMalformedObjectWithImpossibleKey
                if (_$jscmd("lib/ubjson-parser.js", "cond", "169_12_18", v instanceof Error)) {
                    _$jscmd("lib/ubjson-parser.js", "line", 171);
                    // Create error object
                    v = new Error("Malformed object. Error in key parsing. " + "Collected object data: " + JSON.stringify(obj));
                    _$jscmd("lib/ubjson-parser.js", "line", 176);
                    // Store partially collected data in error object
                    v.collectedData = obj;
                    _$jscmd("lib/ubjson-parser.js", "line", 178);
                    // Go up in call stack
                    acc = oldAcc;
                    _$jscmd("lib/ubjson-parser.js", "line", 179);
                    acc(v);
                    _$jscmd("lib/ubjson-parser.js", "line", 180);
                    return;
                }
                _$jscmd("lib/ubjson-parser.js", "line", 183);
                k = v;
                _$jscmd("lib/ubjson-parser.js", "line", 184);
                return;
            }
            // Malformed object with error in value parsing
            // see:  https://github.com/Sannis/node-ubjson/issues/23
            // test: UnpackMalformedObjectWithImpossibleValue
            if (_$jscmd("lib/ubjson-parser.js", "cond", "190_10_18", v instanceof Error)) {
                _$jscmd("lib/ubjson-parser.js", "line", 192);
                // Add partially collected data
                obj[k] = v.collectedData;
                _$jscmd("lib/ubjson-parser.js", "line", 194);
                // Create error object
                v = new Error('Malformed object. Bad value for key "' + k + '". ' + "Collected object data: " + JSON.stringify(obj));
                _$jscmd("lib/ubjson-parser.js", "line", 199);
                // Store partially collected data in error object
                v.collectedData = obj;
                _$jscmd("lib/ubjson-parser.js", "line", 201);
                // Go up in call stack
                acc = oldAcc;
                _$jscmd("lib/ubjson-parser.js", "line", 202);
                acc(v);
                _$jscmd("lib/ubjson-parser.js", "line", 203);
                return;
            }
            _$jscmd("lib/ubjson-parser.js", "line", 206);
            obj[k] = v;
            _$jscmd("lib/ubjson-parser.js", "line", 207);
            k = undefined;
            _$jscmd("lib/ubjson-parser.js", "line", 209);
            numKeys += 1;
            if (_$jscmd("lib/ubjson-parser.js", "cond", "211_10_17", numKeys === nvals)) {
                _$jscmd("lib/ubjson-parser.js", "line", 212);
                acc = oldAcc;
                _$jscmd("lib/ubjson-parser.js", "line", 213);
                acc(obj);
            }
        };
    };
    _$jscmd("lib/ubjson-parser.js", "line", 219);
    // Return a function for unpacking an unknown-length object
    var unpackUnknownLengthObject = function(oldAcc) {
        _$jscmd("lib/ubjson-parser.js", "line", 220);
        var obj = {};
        _$jscmd("lib/ubjson-parser.js", "line", 221);
        var k;
        _$jscmd("lib/ubjson-parser.js", "line", 223);
        // === undefined;
        return function(v, isEnd) {
            if (_$jscmd("lib/ubjson-parser.js", "cond", "224_10_6", !isEnd)) {
                if (_$jscmd("lib/ubjson-parser.js", "cond", "225_12_15", k === undefined)) {
                    // Malformed object with Array as key
                    // see:  https://github.com/Sannis/node-ubjson/issues/21
                    // test: UnpackMalformedUnknownLengthObjectWithArrayKey
                    if (_$jscmd("lib/ubjson-parser.js", "cond", "229_14_16", Array.isArray(v))) {
                        _$jscmd("lib/ubjson-parser.js", "line", 231);
                        // Create error object
                        v = new Error("Malformed object. Key must not be an Array. " + "Collected object data: " + JSON.stringify(obj));
                        _$jscmd("lib/ubjson-parser.js", "line", 236);
                        // Store partially collected data in error object
                        v.collectedData = obj;
                        _$jscmd("lib/ubjson-parser.js", "line", 238);
                        // Go up in call stack
                        acc = oldAcc;
                        _$jscmd("lib/ubjson-parser.js", "line", 239);
                        acc(v);
                        _$jscmd("lib/ubjson-parser.js", "line", 240);
                        return;
                    }
                    // Malformed object with Object as key
                    // see:  https://github.com/Sannis/node-ubjson/issues/21
                    // test: UnpackMalformedUnknownLengthObjectWithObjectKey
                    if (_$jscmd("lib/ubjson-parser.js", "cond", "246_14_24", v.constructor === Object)) {
                        _$jscmd("lib/ubjson-parser.js", "line", 248);
                        // Create error object
                        v = new Error("Malformed object. Key must not be an Object. " + "Collected object data: " + JSON.stringify(obj));
                        _$jscmd("lib/ubjson-parser.js", "line", 253);
                        // Store partially collected data in error object
                        v.collectedData = obj;
                        _$jscmd("lib/ubjson-parser.js", "line", 255);
                        // Go up in call stack
                        acc = oldAcc;
                        _$jscmd("lib/ubjson-parser.js", "line", 256);
                        acc(v);
                        _$jscmd("lib/ubjson-parser.js", "line", 257);
                        return;
                    }
                    // Malformed object with error in key parsing
                    // see:  https://github.com/Sannis/node-ubjson/issues/22
                    // test: UnpackMalformedUnknownLengthObjectWithImpossibleKey
                    if (_$jscmd("lib/ubjson-parser.js", "cond", "263_14_18", v instanceof Error)) {
                        _$jscmd("lib/ubjson-parser.js", "line", 265);
                        // Create error object
                        v = new Error("Malformed object. Error in key parsing. " + "Collected object data: " + JSON.stringify(obj));
                        _$jscmd("lib/ubjson-parser.js", "line", 270);
                        // Store partially collected data in error object
                        v.collectedData = obj;
                        _$jscmd("lib/ubjson-parser.js", "line", 272);
                        // Go up in call stack
                        acc = oldAcc;
                        _$jscmd("lib/ubjson-parser.js", "line", 273);
                        acc(v);
                        _$jscmd("lib/ubjson-parser.js", "line", 274);
                        return;
                    }
                    _$jscmd("lib/ubjson-parser.js", "line", 277);
                    k = v;
                    _$jscmd("lib/ubjson-parser.js", "line", 278);
                    return;
                }
                // Malformed object with error in value parsing
                // see:  https://github.com/Sannis/node-ubjson/issues/14
                // test: UnpackMalformedUnknownLengthObjectWithImpossibleValue
                if (_$jscmd("lib/ubjson-parser.js", "cond", "284_12_18", v instanceof Error)) {
                    _$jscmd("lib/ubjson-parser.js", "line", 286);
                    // Add partially collected data
                    obj[k] = v.collectedData;
                    _$jscmd("lib/ubjson-parser.js", "line", 288);
                    // Create error object
                    v = new Error('Malformed object. Bad value for key "' + k + '". ' + "Collected object data: " + JSON.stringify(obj));
                    _$jscmd("lib/ubjson-parser.js", "line", 293);
                    // Store partially collected data in error object
                    v.collectedData = obj;
                    _$jscmd("lib/ubjson-parser.js", "line", 295);
                    // Go up in call stack
                    acc = oldAcc;
                    _$jscmd("lib/ubjson-parser.js", "line", 296);
                    acc(v);
                    _$jscmd("lib/ubjson-parser.js", "line", 297);
                    return;
                }
                _$jscmd("lib/ubjson-parser.js", "line", 300);
                obj[k] = v;
                _$jscmd("lib/ubjson-parser.js", "line", 301);
                k = undefined;
            } else {
                // Malformed object without last value
                // see:  https://github.com/Sannis/node-ubjson/issues/14
                // test: UnpackMalformedUnknownLengthObject
                if (_$jscmd("lib/ubjson-parser.js", "cond", "306_12_15", k !== undefined)) {
                    _$jscmd("lib/ubjson-parser.js", "line", 311);
                    // Add partially collected data
                    // TODO: Consider is this useful, see #26
                    //obj[k] = null;
                    // Create error object
                    var err = new Error('Malformed unknown-length object. No value for key "' + k + '".' + "Collected object data: " + JSON.stringify(obj));
                    _$jscmd("lib/ubjson-parser.js", "line", 316);
                    // Store partially collected data in error object
                    err.collectedData = obj;
                    _$jscmd("lib/ubjson-parser.js", "line", 318);
                    // err -> obj
                    obj = err;
                }
                _$jscmd("lib/ubjson-parser.js", "line", 322);
                // Go up in call stack
                acc = oldAcc;
                _$jscmd("lib/ubjson-parser.js", "line", 323);
                acc(obj);
            }
        };
    };
    _$jscmd("lib/ubjson-parser.js", "line", 330);
    // Parse a single value, calling acc() as values are accumulated
    return function(v) {
        if (_$jscmd("lib/ubjson-parser.js", "cond", "331_8_20", doneParsing === true)) {
            _$jscmd("lib/ubjson-parser.js", "line", 332);
            return strtok.DONE;
        }
        if (_$jscmd("lib/ubjson-parser.js", "cond", "335_8_15", v === undefined)) {
            _$jscmd("lib/ubjson-parser.js", "line", 336);
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
            if (_$jscmd("lib/ubjson-parser.js", "cond", "348_12_22", v === ubjsonTypes.NOOP)) {
                _$jscmd("lib/ubjson-parser.js", "line", 350);
                // Should be quietly skipped by parser
                break;
            }
            // null/undefined
            if (_$jscmd("lib/ubjson-parser.js", "cond", "354_12_22", v === ubjsonTypes.NULL)) {
                _$jscmd("lib/ubjson-parser.js", "line", 355);
                acc(null);
                _$jscmd("lib/ubjson-parser.js", "line", 356);
                break;
            }
            // true
            if (_$jscmd("lib/ubjson-parser.js", "cond", "360_12_22", v === ubjsonTypes.TRUE)) {
                _$jscmd("lib/ubjson-parser.js", "line", 361);
                acc(true);
                _$jscmd("lib/ubjson-parser.js", "line", 362);
                break;
            }
            // false
            if (_$jscmd("lib/ubjson-parser.js", "cond", "366_12_23", v === ubjsonTypes.FALSE)) {
                _$jscmd("lib/ubjson-parser.js", "line", 367);
                acc(false);
                _$jscmd("lib/ubjson-parser.js", "line", 368);
                break;
            }
            // byte
            if (_$jscmd("lib/ubjson-parser.js", "cond", "372_12_22", v === ubjsonTypes.BYTE)) {
                _$jscmd("lib/ubjson-parser.js", "line", 373);
                type = ubjsonTypes.BYTE;
                _$jscmd("lib/ubjson-parser.js", "line", 374);
                return strtok.INT8;
            }
            // int16
            if (_$jscmd("lib/ubjson-parser.js", "cond", "378_12_23", v === ubjsonTypes.INT16)) {
                _$jscmd("lib/ubjson-parser.js", "line", 379);
                type = ubjsonTypes.INT16;
                _$jscmd("lib/ubjson-parser.js", "line", 380);
                return strtok.INT16_BE;
            }
            // int32
            if (_$jscmd("lib/ubjson-parser.js", "cond", "384_12_23", v === ubjsonTypes.INT32)) {
                _$jscmd("lib/ubjson-parser.js", "line", 385);
                type = ubjsonTypes.INT32;
                _$jscmd("lib/ubjson-parser.js", "line", 386);
                return strtok.INT32_BE;
            }
            // int64
            if (_$jscmd("lib/ubjson-parser.js", "cond", "390_12_23", v === ubjsonTypes.INT64)) {
                _$jscmd("lib/ubjson-parser.js", "line", 391);
                type = ubjsonTypes.INT64;
                _$jscmd("lib/ubjson-parser.js", "line", 392);
                return strtok.INT64_BE;
            }
            // float
            if (_$jscmd("lib/ubjson-parser.js", "cond", "396_12_23", v === ubjsonTypes.FLOAT)) {
                _$jscmd("lib/ubjson-parser.js", "line", 397);
                type = ubjsonTypes.FLOAT;
                _$jscmd("lib/ubjson-parser.js", "line", 398);
                return strtok.FLOAT_BE;
            }
            // double
            if (_$jscmd("lib/ubjson-parser.js", "cond", "402_12_24", v === ubjsonTypes.DOUBLE)) {
                _$jscmd("lib/ubjson-parser.js", "line", 403);
                type = ubjsonTypes.DOUBLE;
                _$jscmd("lib/ubjson-parser.js", "line", 404);
                return strtok.DOUBLE_BE;
            }
            // short huge number
            if (_$jscmd("lib/ubjson-parser.js", "cond", "408_12_27", v === ubjsonTypes.SHORTHUGE)) {
                _$jscmd("lib/ubjson-parser.js", "line", 409);
                type = ubjsonTypes.SHORTHUGE;
                _$jscmd("lib/ubjson-parser.js", "line", 410);
                return strtok.UINT8;
            }
            // huge number
            if (_$jscmd("lib/ubjson-parser.js", "cond", "414_12_22", v === ubjsonTypes.HUGE)) {
                _$jscmd("lib/ubjson-parser.js", "line", 415);
                type = ubjsonTypes.HUGE;
                _$jscmd("lib/ubjson-parser.js", "line", 416);
                return strtok.UINT32_BE;
            }
            // short string
            if (_$jscmd("lib/ubjson-parser.js", "cond", "420_12_29", v === ubjsonTypes.SHORTSTRING)) {
                _$jscmd("lib/ubjson-parser.js", "line", 421);
                type = ubjsonTypes.SHORTSTRING;
                _$jscmd("lib/ubjson-parser.js", "line", 422);
                return strtok.UINT8;
            }
            // string
            if (_$jscmd("lib/ubjson-parser.js", "cond", "426_12_24", v === ubjsonTypes.STRING)) {
                _$jscmd("lib/ubjson-parser.js", "line", 427);
                type = ubjsonTypes.STRING;
                _$jscmd("lib/ubjson-parser.js", "line", 428);
                return strtok.UINT32_BE;
            }
            // short array
            if (_$jscmd("lib/ubjson-parser.js", "cond", "432_12_28", v === ubjsonTypes.SHORTARRAY)) {
                _$jscmd("lib/ubjson-parser.js", "line", 433);
                type = ubjsonTypes.SHORTARRAY;
                _$jscmd("lib/ubjson-parser.js", "line", 434);
                return strtok.UINT8;
            }
            // array
            if (_$jscmd("lib/ubjson-parser.js", "cond", "438_12_23", v === ubjsonTypes.ARRAY)) {
                _$jscmd("lib/ubjson-parser.js", "line", 439);
                type = ubjsonTypes.ARRAY;
                _$jscmd("lib/ubjson-parser.js", "line", 440);
                return strtok.UINT32_BE;
            }
            // short object
            if (_$jscmd("lib/ubjson-parser.js", "cond", "444_12_29", v === ubjsonTypes.SHORTOBJECT)) {
                _$jscmd("lib/ubjson-parser.js", "line", 445);
                type = ubjsonTypes.SHORTOBJECT;
                _$jscmd("lib/ubjson-parser.js", "line", 446);
                return strtok.UINT8;
            }
            // object
            if (_$jscmd("lib/ubjson-parser.js", "cond", "450_12_24", v === ubjsonTypes.OBJECT)) {
                _$jscmd("lib/ubjson-parser.js", "line", 451);
                type = ubjsonTypes.OBJECT;
                _$jscmd("lib/ubjson-parser.js", "line", 452);
                return strtok.UINT32_BE;
            }
            // unknown-length container end
            if (_$jscmd("lib/ubjson-parser.js", "cond", "456_12_21", v === ubjsonTypes.END)) {
                _$jscmd("lib/ubjson-parser.js", "line", 457);
                acc(null, true);
                _$jscmd("lib/ubjson-parser.js", "line", 458);
                break;
            }
            _$jscmd("lib/ubjson-parser.js", "line", 464);
            // Unknown type
            // - return Error
            // - finish parsing
            acc(new Error("Cannot parse unknown type marker '" + v + "' (decimal)"));
            _$jscmd("lib/ubjson-parser.js", "line", 465);
            return strtok.DONE;

          case ubjsonTypes.BYTE:
          case ubjsonTypes.INT16:
          case ubjsonTypes.INT32:
          case ubjsonTypes.INT64:
          case ubjsonTypes.FLOAT:
          case ubjsonTypes.DOUBLE:
            _$jscmd("lib/ubjson-parser.js", "line", 473);
            acc(v);
            _$jscmd("lib/ubjson-parser.js", "line", 474);
            type = undefined;
            _$jscmd("lib/ubjson-parser.js", "line", 475);
            break;

          case ubjsonTypes.SHORTHUGE:
          case ubjsonTypes.HUGE:
            _$jscmd("lib/ubjson-parser.js", "line", 479);
            type = STRINGEND;
            _$jscmd("lib/ubjson-parser.js", "line", 480);
            return new strtok.StringType(v, "utf-8");

          case ubjsonTypes.SHORTSTRING:
          case ubjsonTypes.STRING:
            _$jscmd("lib/ubjson-parser.js", "line", 484);
            type = STRINGEND;
            _$jscmd("lib/ubjson-parser.js", "line", 485);
            return new strtok.StringType(v, "utf-8");

          case STRINGEND:
            _$jscmd("lib/ubjson-parser.js", "line", 488);
            acc(v.toString());
            _$jscmd("lib/ubjson-parser.js", "line", 489);
            type = undefined;
            _$jscmd("lib/ubjson-parser.js", "line", 490);
            break;

          case ubjsonTypes.SHORTARRAY:
            if (_$jscmd("lib/ubjson-parser.js", "cond", "493_12_9", v === 255)) {
                _$jscmd("lib/ubjson-parser.js", "line", 494);
                acc = unpackUnknownLengthArray(acc);
            } else {
                _$jscmd("lib/ubjson-parser.js", "line", 496);
                acc = unpackArray(v, acc);
            }
            _$jscmd("lib/ubjson-parser.js", "line", 498);
            type = undefined;
            _$jscmd("lib/ubjson-parser.js", "line", 499);
            break;

          case ubjsonTypes.ARRAY:
            _$jscmd("lib/ubjson-parser.js", "line", 502);
            acc = unpackArray(v, acc);
            _$jscmd("lib/ubjson-parser.js", "line", 503);
            type = undefined;
            _$jscmd("lib/ubjson-parser.js", "line", 504);
            break;

          case ubjsonTypes.SHORTOBJECT:
            if (_$jscmd("lib/ubjson-parser.js", "cond", "507_12_9", v === 255)) {
                _$jscmd("lib/ubjson-parser.js", "line", 508);
                acc = unpackUnknownLengthObject(acc);
            } else {
                _$jscmd("lib/ubjson-parser.js", "line", 510);
                acc = unpackObject(v, acc);
            }
            _$jscmd("lib/ubjson-parser.js", "line", 512);
            type = undefined;
            _$jscmd("lib/ubjson-parser.js", "line", 513);
            break;

          case ubjsonTypes.OBJECT:
            _$jscmd("lib/ubjson-parser.js", "line", 516);
            acc = unpackObject(v, acc);
            _$jscmd("lib/ubjson-parser.js", "line", 517);
            type = undefined;
            _$jscmd("lib/ubjson-parser.js", "line", 518);
            break;
        }
        _$jscmd("lib/ubjson-parser.js", "line", 522);
        // We're reading a new primitive; go get it
        return strtok.UINT8;
    };
}

_$jscmd("lib/ubjson-parser.js", "line", 527);

// Export parser
module.exports = UbjsonParser;