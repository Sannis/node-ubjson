
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
})('lib/ubjson-pack.js', [8,9,10,13,16,161,32,33,34,35,37,39,43,46,49,95,55,56,58,59,61,62,64,67,70,71,73,74,76,81,92,85,86,88,89,98,109,110,112,102,103,105,106,153,116,118,119,130,123,124,126,127,131,134,145,138,139,141,142,146,147,150,156], {"37_21_9":0,"37_33_1":0,"46_43_16":0,"46_62_17":0,"53_10_9":0,"54_12_21":0,"54_12_9":0,"54_25_8":0,"57_19_25":0,"57_19_11":0,"57_34_10":0,"60_19_35":0,"60_19_16":0,"60_39_15":0,"69_12_33":0,"69_12_15":0,"69_31_14":0,"72_19_35":0,"72_19_16":0,"72_39_15":0,"80_10_18":0,"84_12_21":0,"101_10_23":0,"115_10_10":0,"117_17_18":0,"120_17_16":0,"122_12_15":0,"133_17_24":0,"137_12_16":0}, ["/*!"," * Copyright by Oleg Efimov"," *"," * See license text in LICENSE file"," */","","// Require dependencies","var Buffer = require('buffer').Buffer;","var assert = require('assert');","var strtok = require('strtok');","","// Require UBJSON types definition","var ubjsonTypes = require(\"./ubjson-types.js\");","","// Require class for int64 storing","var Int64 = require('./int64.js');","","/** internal"," * ubjsonPack(stream, buffer, offset, value, flush) -> Integer"," * - stream (Stream|null): Stream to write packed UBJSON (optional)"," * - buffer (Buffer): Buffer to write packed UBJSON"," * - offset (Number): Buffer offset to write"," * - value (mixed): JavaScript value to pack"," * - flush (Function): Flush function, used to dump packed data to stream (optional)"," *"," * Pack a value into the given stream (or buffer and offset),"," * flushing using the provided function."," *"," * Returns buffer offset after write."," **/","function ubjsonPack(s, b, bo, v, flush) {","  assert.ok(b instanceof Buffer);","  assert.ok(typeof bo === 'number');","  assert.ok(bo >= 0);","  assert.ok(bo < b.length);","","  v = (v === null) ? undefined : v;","","  var len = 0;","","  switch (typeof v) {","    case 'undefined':","      return strtok.UINT8.put(b, bo, ubjsonTypes.NULL, flush);","","    case 'boolean':","      return strtok.UINT8.put(b, bo, (v) ? ubjsonTypes.TRUE : ubjsonTypes.FALSE, flush);","","    case 'number':","      var encodeNumberAsHuge = false;","","      // Useful for debugging FPN: http://www.binaryconvert.com/","","      if (~~v === v) {","        if (-128 <= v && v <= 127) {","          len  = strtok.UINT8.put(b, bo, ubjsonTypes.BYTE, flush);","          len += strtok.INT8.put(b, bo + len, v, flush);","        } else if (-32428 <= v && v <= 32427) {","          len  = strtok.UINT8.put(b, bo, ubjsonTypes.INT16, flush);","          len += strtok.INT16_BE.put(b, bo + len, v, flush);","        } else if (-2147483648 <= v && v <= 2147483647) {","          len  = strtok.UINT8.put(b, bo, ubjsonTypes.INT32, flush);","          len += strtok.INT32_BE.put(b, bo + len, v, flush);","        } else {","          encodeNumberAsHuge = true;","        }","      } else {","        var absV = Math.abs(v);","","        if (1.18e-38 < absV && absV < 3.40e38) {","          len  = strtok.UINT8.put(b, bo + len, ubjsonTypes.FLOAT, flush);","          len += strtok.FLOAT_BE.put(b, bo + len, v, flush);","        } else if (2.23e-308 < absV && absV < 1.79e308) {","          len  = strtok.UINT8.put(b, bo + len, ubjsonTypes.DOUBLE, flush);","          len += strtok.DOUBLE_BE.put(b, bo + len, v, flush);","        } else {","          encodeNumberAsHuge = true;","        }","      }","","      if (encodeNumberAsHuge) {","        var stringV = v.toString();","","        // 255 = 0xFF is valid for huges","        if (stringV.length <= 255) {","          len  = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTHUGE, flush);","          len += strtok.UINT8.put(b, bo + len, stringV.length, flush);","        } else {","          len  = strtok.UINT8.put(b, bo, ubjsonTypes.HUGE, flush);","          len += strtok.UINT32_BE.put(b, bo + len, stringV.length, flush);","        }","","        len += b.write(stringV, bo + len, 'utf-8');","      }","","      return len;","","    case 'string':","      var stringByteLength = Buffer.byteLength(v, 'utf-8');","","      // 255 = 0xFF is valid for strings","      if (stringByteLength <= 255) {","        len  = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTSTRING, flush);","        len += strtok.UINT8.put(b, bo + len, stringByteLength, flush);","      } else {","        len  = strtok.UINT8.put(b, bo, ubjsonTypes.STRING, flush);","        len += strtok.UINT32_BE.put(b, bo + len, stringByteLength, flush);","      }","","      var UTF8STRING = new strtok.StringType(stringByteLength, 'utf-8');","      len += UTF8STRING.put(b, bo + len, v, flush);","","      return len;","","    case 'object':","      if (v === null) {","        len = strtok.UINT8.put(b, bo, ubjsonTypes.NULL, flush);","      } else if (v instanceof Int64) {","        len = strtok.UINT8.put(b, bo, ubjsonTypes.INT64, flush);","        len += strtok.INT64_BE.put(b, bo + len, v, flush);","      } else if (Array.isArray(v)) {","        // 255 (0xFF) is reserved fo unknown-length containers","        if (v.length <= 254) {","          len  = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTARRAY, flush);","          len += strtok.UINT8.put(b, bo + len, v.length, flush);","        } else {","          len  = strtok.UINT8.put(b, bo, ubjsonTypes.ARRAY, flush);","          len += strtok.UINT32_BE.put(b, bo + len, v.length, flush);","        }","","        v.forEach(function(vv) {","          len += ubjsonPack(s, b, bo + len, vv, flush);","        });","      } else if (v.constructor === Object) {","        var vk = Object.keys(v);","","        // 255 (0xFF) is reserved fo unknown-length containers","        if (vk.length <= 254) {","          len = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTOBJECT, flush);","          len += strtok.UINT8.put(b, bo + len, vk.length, flush);","        } else {","          len = strtok.UINT8.put(b, bo, ubjsonTypes.OBJECT, flush);","          len += strtok.UINT32_BE.put(b, bo + len, vk.length, flush);","        }","","        vk.forEach(function(k) {","          len += ubjsonPack(s, b, bo + len, k, flush);","          len += ubjsonPack(s, b, bo + len, v[k], flush);","        });","      } else {","        throw new Error('Cannot pack object constructed by ' + v.constructor.valueOf());","      }","","      return len;","","    default:","      throw new Error('Cannot pack value of type ' + typeof v);","  }","}","","// Export","module.exports = ubjsonPack;",""]);
/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */
// Require dependencies
_$jscmd("lib/ubjson-pack.js", "line", 8);

var Buffer = require("buffer").Buffer;

_$jscmd("lib/ubjson-pack.js", "line", 9);

var assert = require("assert");

_$jscmd("lib/ubjson-pack.js", "line", 10);

var strtok = require("strtok");

_$jscmd("lib/ubjson-pack.js", "line", 13);

// Require UBJSON types definition
var ubjsonTypes = require("./ubjson-types.js");

_$jscmd("lib/ubjson-pack.js", "line", 16);

// Require class for int64 storing
var Int64 = require("./int64.js");

/** internal
 * ubjsonPack(stream, buffer, offset, value, flush) -> Integer
 * - stream (Stream|null): Stream to write packed UBJSON (optional)
 * - buffer (Buffer): Buffer to write packed UBJSON
 * - offset (Number): Buffer offset to write
 * - value (mixed): JavaScript value to pack
 * - flush (Function): Flush function, used to dump packed data to stream (optional)
 *
 * Pack a value into the given stream (or buffer and offset),
 * flushing using the provided function.
 *
 * Returns buffer offset after write.
 **/
function ubjsonPack(s, b, bo, v, flush) {
    _$jscmd("lib/ubjson-pack.js", "line", 32);
    assert.ok(b instanceof Buffer);
    _$jscmd("lib/ubjson-pack.js", "line", 33);
    assert.ok(typeof bo === "number");
    _$jscmd("lib/ubjson-pack.js", "line", 34);
    assert.ok(bo >= 0);
    _$jscmd("lib/ubjson-pack.js", "line", 35);
    assert.ok(bo < b.length);
    _$jscmd("lib/ubjson-pack.js", "line", 37);
    v = v === null ? _$jscmd("lib/ubjson-pack.js", "cond", "37_21_9", undefined) : _$jscmd("lib/ubjson-pack.js", "cond", "37_33_1", v);
    _$jscmd("lib/ubjson-pack.js", "line", 39);
    var len = 0;
    switch (typeof v) {
      case "undefined":
        _$jscmd("lib/ubjson-pack.js", "line", 43);
        return strtok.UINT8.put(b, bo, ubjsonTypes.NULL, flush);

      case "boolean":
        _$jscmd("lib/ubjson-pack.js", "line", 46);
        return strtok.UINT8.put(b, bo, v ? _$jscmd("lib/ubjson-pack.js", "cond", "46_43_16", ubjsonTypes.TRUE) : _$jscmd("lib/ubjson-pack.js", "cond", "46_62_17", ubjsonTypes.FALSE), flush);

      case "number":
        _$jscmd("lib/ubjson-pack.js", "line", 49);
        var encodeNumberAsHuge = false;
        // Useful for debugging FPN: http://www.binaryconvert.com/
        if (_$jscmd("lib/ubjson-pack.js", "cond", "53_10_9", ~~v === v)) {
            if (_$jscmd("lib/ubjson-pack.js", "cond", "54_12_21", _$jscmd("lib/ubjson-pack.js", "cond", "54_12_9", -128 <= v) && _$jscmd("lib/ubjson-pack.js", "cond", "54_25_8", v <= 127))) {
                _$jscmd("lib/ubjson-pack.js", "line", 55);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.BYTE, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 56);
                len += strtok.INT8.put(b, bo + len, v, flush);
            } else if (_$jscmd("lib/ubjson-pack.js", "cond", "57_19_25", _$jscmd("lib/ubjson-pack.js", "cond", "57_19_11", -32428 <= v) && _$jscmd("lib/ubjson-pack.js", "cond", "57_34_10", v <= 32427))) {
                _$jscmd("lib/ubjson-pack.js", "line", 58);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.INT16, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 59);
                len += strtok.INT16_BE.put(b, bo + len, v, flush);
            } else if (_$jscmd("lib/ubjson-pack.js", "cond", "60_19_35", _$jscmd("lib/ubjson-pack.js", "cond", "60_19_16", -2147483648 <= v) && _$jscmd("lib/ubjson-pack.js", "cond", "60_39_15", v <= 2147483647))) {
                _$jscmd("lib/ubjson-pack.js", "line", 61);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.INT32, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 62);
                len += strtok.INT32_BE.put(b, bo + len, v, flush);
            } else {
                _$jscmd("lib/ubjson-pack.js", "line", 64);
                encodeNumberAsHuge = true;
            }
        } else {
            _$jscmd("lib/ubjson-pack.js", "line", 67);
            var absV = Math.abs(v);
            if (_$jscmd("lib/ubjson-pack.js", "cond", "69_12_33", _$jscmd("lib/ubjson-pack.js", "cond", "69_12_15", 1.18e-38 < absV) && _$jscmd("lib/ubjson-pack.js", "cond", "69_31_14", absV < 3.4e38))) {
                _$jscmd("lib/ubjson-pack.js", "line", 70);
                len = strtok.UINT8.put(b, bo + len, ubjsonTypes.FLOAT, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 71);
                len += strtok.FLOAT_BE.put(b, bo + len, v, flush);
            } else if (_$jscmd("lib/ubjson-pack.js", "cond", "72_19_35", _$jscmd("lib/ubjson-pack.js", "cond", "72_19_16", 2.23e-308 < absV) && _$jscmd("lib/ubjson-pack.js", "cond", "72_39_15", absV < 1.79e308))) {
                _$jscmd("lib/ubjson-pack.js", "line", 73);
                len = strtok.UINT8.put(b, bo + len, ubjsonTypes.DOUBLE, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 74);
                len += strtok.DOUBLE_BE.put(b, bo + len, v, flush);
            } else {
                _$jscmd("lib/ubjson-pack.js", "line", 76);
                encodeNumberAsHuge = true;
            }
        }
        if (_$jscmd("lib/ubjson-pack.js", "cond", "80_10_18", encodeNumberAsHuge)) {
            _$jscmd("lib/ubjson-pack.js", "line", 81);
            var stringV = v.toString();
            // 255 = 0xFF is valid for huges
            if (_$jscmd("lib/ubjson-pack.js", "cond", "84_12_21", stringV.length <= 255)) {
                _$jscmd("lib/ubjson-pack.js", "line", 85);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTHUGE, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 86);
                len += strtok.UINT8.put(b, bo + len, stringV.length, flush);
            } else {
                _$jscmd("lib/ubjson-pack.js", "line", 88);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.HUGE, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 89);
                len += strtok.UINT32_BE.put(b, bo + len, stringV.length, flush);
            }
            _$jscmd("lib/ubjson-pack.js", "line", 92);
            len += b.write(stringV, bo + len, "utf-8");
        }
        _$jscmd("lib/ubjson-pack.js", "line", 95);
        return len;

      case "string":
        _$jscmd("lib/ubjson-pack.js", "line", 98);
        var stringByteLength = Buffer.byteLength(v, "utf-8");
        // 255 = 0xFF is valid for strings
        if (_$jscmd("lib/ubjson-pack.js", "cond", "101_10_23", stringByteLength <= 255)) {
            _$jscmd("lib/ubjson-pack.js", "line", 102);
            len = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTSTRING, flush);
            _$jscmd("lib/ubjson-pack.js", "line", 103);
            len += strtok.UINT8.put(b, bo + len, stringByteLength, flush);
        } else {
            _$jscmd("lib/ubjson-pack.js", "line", 105);
            len = strtok.UINT8.put(b, bo, ubjsonTypes.STRING, flush);
            _$jscmd("lib/ubjson-pack.js", "line", 106);
            len += strtok.UINT32_BE.put(b, bo + len, stringByteLength, flush);
        }
        _$jscmd("lib/ubjson-pack.js", "line", 109);
        var UTF8STRING = new strtok.StringType(stringByteLength, "utf-8");
        _$jscmd("lib/ubjson-pack.js", "line", 110);
        len += UTF8STRING.put(b, bo + len, v, flush);
        _$jscmd("lib/ubjson-pack.js", "line", 112);
        return len;

      case "object":
        if (_$jscmd("lib/ubjson-pack.js", "cond", "115_10_10", v === null)) {
            _$jscmd("lib/ubjson-pack.js", "line", 116);
            len = strtok.UINT8.put(b, bo, ubjsonTypes.NULL, flush);
        } else if (_$jscmd("lib/ubjson-pack.js", "cond", "117_17_18", v instanceof Int64)) {
            _$jscmd("lib/ubjson-pack.js", "line", 118);
            len = strtok.UINT8.put(b, bo, ubjsonTypes.INT64, flush);
            _$jscmd("lib/ubjson-pack.js", "line", 119);
            len += strtok.INT64_BE.put(b, bo + len, v, flush);
        } else if (_$jscmd("lib/ubjson-pack.js", "cond", "120_17_16", Array.isArray(v))) {
            // 255 (0xFF) is reserved fo unknown-length containers
            if (_$jscmd("lib/ubjson-pack.js", "cond", "122_12_15", v.length <= 254)) {
                _$jscmd("lib/ubjson-pack.js", "line", 123);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTARRAY, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 124);
                len += strtok.UINT8.put(b, bo + len, v.length, flush);
            } else {
                _$jscmd("lib/ubjson-pack.js", "line", 126);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.ARRAY, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 127);
                len += strtok.UINT32_BE.put(b, bo + len, v.length, flush);
            }
            _$jscmd("lib/ubjson-pack.js", "line", 130);
            v.forEach(function(vv) {
                _$jscmd("lib/ubjson-pack.js", "line", 131);
                len += ubjsonPack(s, b, bo + len, vv, flush);
            });
        } else if (_$jscmd("lib/ubjson-pack.js", "cond", "133_17_24", v.constructor === Object)) {
            _$jscmd("lib/ubjson-pack.js", "line", 134);
            var vk = Object.keys(v);
            // 255 (0xFF) is reserved fo unknown-length containers
            if (_$jscmd("lib/ubjson-pack.js", "cond", "137_12_16", vk.length <= 254)) {
                _$jscmd("lib/ubjson-pack.js", "line", 138);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTOBJECT, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 139);
                len += strtok.UINT8.put(b, bo + len, vk.length, flush);
            } else {
                _$jscmd("lib/ubjson-pack.js", "line", 141);
                len = strtok.UINT8.put(b, bo, ubjsonTypes.OBJECT, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 142);
                len += strtok.UINT32_BE.put(b, bo + len, vk.length, flush);
            }
            _$jscmd("lib/ubjson-pack.js", "line", 145);
            vk.forEach(function(k) {
                _$jscmd("lib/ubjson-pack.js", "line", 146);
                len += ubjsonPack(s, b, bo + len, k, flush);
                _$jscmd("lib/ubjson-pack.js", "line", 147);
                len += ubjsonPack(s, b, bo + len, v[k], flush);
            });
        } else {
            _$jscmd("lib/ubjson-pack.js", "line", 150);
            throw new Error("Cannot pack object constructed by " + v.constructor.valueOf());
        }
        _$jscmd("lib/ubjson-pack.js", "line", 153);
        return len;

      default:
        _$jscmd("lib/ubjson-pack.js", "line", 156);
        throw new Error("Cannot pack value of type " + typeof v);
    }
}

_$jscmd("lib/ubjson-pack.js", "line", 161);

// Export
module.exports = ubjsonPack;