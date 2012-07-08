/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

// Require dependencies
var Buffer = require('buffer').Buffer;
var assert = require('assert');
var strtok = require('strtok');

// Require UBJSON types definition
var ubjsonTypes = require("./ubjson-types.js");

// Require class for int64 storing
var Int64 = require('./int64.js');

/** internal
 * ubjsonPack(stream, buffer, offset, value, flush) -> Integer
 * - stream (Stream|null): Stream to write packed UBJSON (optional)
 * - buffer (Buffer): Buffer to write packed UBJSON
 * - offset (Number): Buffer offset to write
 * - value (mixed): JavaScript value to pack
 * - flush (Function|null): Flush function, used to dump packed data to stream (optional)
 *
 * Pack a value into the given stream (or buffer and offset),
 * flushing using the provided function.
 *
 * Returns buffer offset after write.
 **/
function ubjsonPack(s, b, bo, v, flush) {
  assert.ok(b instanceof Buffer);
  assert.ok(typeof bo === 'number');
  assert.ok(bo >= 0);
  assert.ok(bo < b.length);

  v = (v === null) ? undefined : v;
  flush = (typeof flush !== "function" && s !== null) ?
    function(b, o) {
      s.write(b.toString('binary', 0, o), 'binary');
    } : flush;

  var len = 0;

  switch (typeof v) {
    case 'undefined':
      return strtok.UINT8.put(b, bo, ubjsonTypes.NULL, flush);

    case 'boolean':
      return strtok.UINT8.put(b, bo, (v) ? ubjsonTypes.TRUE : ubjsonTypes.FALSE, flush);

    case 'number':
      var encodeNumberAsHuge = false;

      // Useful for debugging FPN: http://www.binaryconvert.com/

      if (~~v === v) {
        if (-128 <= v && v <= 127) {
          len  = strtok.UINT8.put(b, bo, ubjsonTypes.BYTE, flush);
          len += strtok.INT8.put(b, bo + len, v, flush);
        } else if (-32428 <= v && v <= 32427) {
          len  = strtok.UINT8.put(b, bo, ubjsonTypes.INT16, flush);
          len += strtok.INT16_BE.put(b, bo + len, v, flush);
        } else if (-2147483648 <= v && v <= 2147483647) {
          len  = strtok.UINT8.put(b, bo, ubjsonTypes.INT32, flush);
          len += strtok.INT32_BE.put(b, bo + len, v, flush);
        } else {
          encodeNumberAsHuge = true;
        }
      } else {
        var absV = Math.abs(v);

        if (1.18e-38 < absV && absV < 3.40e38) {
          len  = strtok.UINT8.put(b, bo + len, ubjsonTypes.FLOAT, flush);
          len += strtok.FLOAT_BE.put(b, bo + len, v, flush);
        } else if (2.23e-308 < absV && absV < 1.79e308) {
          len  = strtok.UINT8.put(b, bo + len, ubjsonTypes.DOUBLE, flush);
          len += strtok.DOUBLE_BE.put(b, bo + len, v, flush);
        } else {
          encodeNumberAsHuge = true;
        }
      }

      if (encodeNumberAsHuge) {
        var stringV = v.toString();

        // 255 = 0xFF is valid for huges
        if (stringV.length <= 255) {
          len  = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTHUGE, flush);
          len += strtok.UINT8.put(b, bo + len, stringV.length, flush);
        } else {
          len  = strtok.UINT8.put(b, bo, ubjsonTypes.HUGE, flush);
          len += strtok.UINT32_BE.put(b, bo + len, stringV.length, flush);
        }

        len += b.write(stringV, bo + len, 'utf-8');
      }

      return len;

    case 'string':
      var stringByteLength = Buffer.byteLength(v, 'utf-8');

      // 255 = 0xFF is valid for strings
      if (stringByteLength <= 255) {
        len  = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTSTRING, flush);
        len += strtok.UINT8.put(b, bo + len, stringByteLength, flush);
      } else {
        len  = strtok.UINT8.put(b, bo, ubjsonTypes.STRING, flush);
        len += strtok.UINT32_BE.put(b, bo + len, stringByteLength, flush);
      }

      var UTF8STRING = new strtok.StringType(stringByteLength, 'utf-8');
      len += UTF8STRING.put(b, bo + len, v, flush);

      return len;

    case 'object':
      if (v === null) {
        len = strtok.UINT8.put(b, bo, ubjsonTypes.NULL, flush);
      } else if (v instanceof Int64) {
        len = strtok.UINT8.put(b, bo, ubjsonTypes.INT64, flush);
        len += strtok.INT64_BE.put(b, bo + len, v, flush);
      } else if (Array.isArray(v)) {
        // 255 (0xFF) is reserved fo unknown-length containers
        if (v.length <= 254) {
          len  = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTARRAY, flush);
          len += strtok.UINT8.put(b, bo + len, v.length, flush);
        } else {
          len  = strtok.UINT8.put(b, bo, ubjsonTypes.ARRAY, flush);
          len += strtok.UINT32_BE.put(b, bo + len, v.length, flush);
        }

        v.forEach(function(vv) {
          len += ubjsonPack(s, b, bo + len, vv, flush);
        });
      } else if (v.constructor === Object) {
        var vk = Object.keys(v);

        // 255 (0xFF) is reserved fo unknown-length containers
        if (vk.length <= 254) {
          len = strtok.UINT8.put(b, bo, ubjsonTypes.SHORTOBJECT, flush);
          len += strtok.UINT8.put(b, bo + len, vk.length, flush);
        } else {
          len = strtok.UINT8.put(b, bo, ubjsonTypes.OBJECT, flush);
          len += strtok.UINT32_BE.put(b, bo + len, vk.length, flush);
        }

        vk.forEach(function(k) {
          len += ubjsonPack(s, b, bo + len, k, flush);
          len += ubjsonPack(s, b, bo + len, v[k], flush);
        });
      } else {
        throw new Error('Cannot pack object constructed by ' + v.constructor.valueOf());
      }

      return len;

    default:
      throw new Error('Cannot pack value of type ' + typeof v);
  }
}

// Export
module.exports = ubjsonPack;
