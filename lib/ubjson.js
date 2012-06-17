/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');
var util = require('util');
var strtok = require('../node_modules/strtok/lib/strtok.js');

// Extend node-strtok for reading/writing float and double
var maybeFlush = function(b, o, len, flush) {
  if (o + len > b.length) {
    if (typeof(flush) !== 'function') {
      throw new Error(
        'Buffer out of space and no valid flush() function found'
      );
    }

    flush(b, o);

    return 0;
  }

  return o;
};

strtok.FLOAT_BE = {
    len : 4,
    get : function(buf, off) {
      return buf.readFloatBE(off);
    },
    put : function(b, o, v, flush) {
      assert.equal(typeof o, 'number');
      assert.equal(typeof v, 'number');
      var absV = Math.abs(v);
      assert.ok(1.18e-38 < absV && absV < 3.40e38);
      assert.ok(o >= 0);
      assert.ok(this.len <= b.length);

      var no = maybeFlush(b, o, this.len, flush);
      b.writeFloatBE(v, o);

      return (no - o) + this.len;
    }
};

strtok.DOUBLE_BE = {
    len : 8,
    get : function(buf, off) {
      return buf.readDoubleBE(off);
    },
    put : function(b, o, v, flush) {
      assert.equal(typeof o, 'number');
      assert.equal(typeof v, 'number');
      var absV = Math.abs(v);
      assert.ok(2.23e-308 < absV && absV < 1.79e308);
      assert.ok(o >= 0);
      assert.ok(this.len <= b.length);

      var no = maybeFlush(b, o, this.len, flush);
      b.writeDoubleBE(v, o);

      return (no - o) + this.len;
    }
};

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

// Prepare types hash to use
var typesKeys = Object.getOwnPropertyNames(types);
typesKeys.forEach(function(typeKey) {
  types[typeKey] = types[typeKey].charCodeAt(0);
});

// Generator function for handing to strtok.parse(); takes an accumulator
// callback to invoke when a top-level type is read from the stream
function UbjsonStrtokParser(acc) {
  // Type that we're in when reading a value
  var type; // === undefined;

  // Special type for string parsing
  var STRINGEND = -1;

  // Return a function for unpacking an array
  var unpackArray = function(nvals, oldAcc) {
    var arr = [];

    if (nvals === 0) {
      acc(arr);
      return oldAcc;
    }

    return function(v) {
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
        arr.push(v);
      } else {
        acc = oldAcc;
        acc(arr);
      }
    };
  };

  // Return a function for unpacking an object
  var unpackObject = function(nvals, oldAcc) {
    var o = {};
    var k; // === undefined;
    var numKeys = 0;

    if (nvals === 0) {
      acc(o);
      return oldAcc;
    }

    return function(v) {
      if (k === undefined) {
        k = v;
        return;
      }

      o[k] = v;
      k = undefined;

      numKeys += 1;

      if (numKeys === nvals) {
        acc = oldAcc;
        acc(o);
      }
    };
  };

  // Return a function for unpacking an unknown-length object
  var unpackUnknownLengthObject = function(oldAcc) {
    var o = {};
    var k; // === undefined;

    return function(v, isEnd) {
      if (!isEnd) {
        if (k === undefined) {
          k = v;
          return;
        }

        o[k] = v;
        k = undefined;
      } else {
        acc = oldAcc;
        acc(o);
      }
    };
  };


  // Parse a single value, calling acc() as values are accumulated
  return function(v) {
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

        // null/undefined
        if (v === types.NULL) {
          acc(null);
          break;
        }

        // true
        if (v === types.TRUE) {
          acc(true);
          break;
        }

        // false
        if (v === types.FALSE) {
          acc(false);
          break;
        }

        // byte
        if (v === types.BYTE) {
          type = types.BYTE;
          return strtok.INT8;
        }

        // int16
        if (v === types.INT16) {
          type = types.INT16;
          return strtok.INT16_BE;
        }

        // int32
        if (v === types.INT32) {
          type = types.INT32;
          return strtok.INT32_BE;
        }

        // float
        if (v === types.FLOAT) {
          type = types.FLOAT;
          return strtok.FLOAT_BE;
        }

        // double
        if (v === types.DOUBLE) {
          type = types.DOUBLE;
          return strtok.DOUBLE_BE;
        }

        // short huge number
        if (v === types.SHORTHUGE) {
          type = types.SHORTHUGE;
          return strtok.UINT8;
        }

        // huge number
        if (v === types.HUGE) {
          type = types.HUGE;
          return strtok.UINT32_BE;
        }

        // short string
        if (v === types.SHORTSTRING) {
          type = types.SHORTSTRING;
          return strtok.UINT8;
        }

        // string
        if (v === types.STRING) {
          type = types.STRING;
          return strtok.UINT32_BE;
        }

        // short array
        if (v === types.SHORTARRAY) {
          type = types.SHORTARRAY;
          return strtok.UINT8;
        }

        // array
        if (v === types.ARRAY) {
          type = types.ARRAY;
          return strtok.UINT32_BE;
        }

        // short object
        if (v === types.SHORTOBJECT) {
          type = types.SHORTOBJECT;
          return strtok.UINT8;
        }

        // object
        if (v === types.OBJECT) {
          type = types.OBJECT;
          return strtok.UINT32_BE;
        }

        // unknown-length container end
        if (v === types.END) {
          acc(null, true);
          break;
        }

        throw new Error('Cannot parse unexpected type: ' + v + '; aborting');

      case types.BYTE:
      case types.INT16:
      case types.INT32:
      case types.FLOAT:
      case types.DOUBLE:
        acc(v);
        type = undefined;
        break;

      case types.SHORTHUGE:
      case types.HUGE:
        type = STRINGEND;
        return new strtok.StringType(v, 'utf-8');

      case types.SHORTSTRING:
      case types.STRING:
        type = STRINGEND;
        return new strtok.StringType(v, 'utf-8');

      case STRINGEND:
        acc(v.toString());
        type = undefined;
        break;

      case types.SHORTARRAY:
        if (v === 255) {
          acc = unpackUnknownLengthArray(acc);
        } else {
          acc = unpackArray(v, acc);
        }
        type = undefined;
        break;

      case types.ARRAY:
        acc = unpackArray(v, acc);
        type = undefined;
        break;

      case types.SHORTOBJECT:
        if (v === 255) {
          acc = unpackUnknownLengthObject(acc);
        } else {
          acc = unpackObject(v, acc);
        }
        type = undefined;
        break;

      case types.OBJECT:
        acc = unpackObject(v, acc);
        type = undefined;
        break;
    }

    // We're reading a new primitive; go get it
    return strtok.UINT8;
  };
}

// A mock stream implementation that breaks up provided data into
// 1-byte chunks and emits 'data' events. This is used to simulate
// data arriving with arbitrary packet boundaries.
function BufferStream(buffer) {
    EventEmitter.call(this);

    var self = this;

    var emitData = function() {
        var len = 1;

        var b = buffer.slice(0, len);

        if (len < buffer.length) {
            buffer = buffer.slice(len, buffer.length);
            process.nextTick(emitData);
        } else {
            process.nextTick(function() {
                self.emit('end');
            });
        }

        self.emit('data', b);
    };

    process.nextTick(emitData);
}
util.inherits(BufferStream, EventEmitter);

function unpackBuffer(buffer, callback) {
  var stream = new BufferStream(buffer);

  var ubjsonStrtokParser = new UbjsonStrtokParser(function (v) {
    callback(v);
  });

  strtok.parse(stream, ubjsonStrtokParser);
}

// Pack a value into the given stream (or buffer and offset),
// flushing using the provided function.
function ubjsonStrtokPack(s, b, bo, v, flush) {
  assert.ok(b instanceof Buffer);
  assert.ok(typeof bo === 'number');
  assert.ok(bo >= 0);
  assert.ok(bo < b.length);

  v = (v === null) ? undefined : v;
  flush = (flush === undefined && s !== undefined) ?
    function(b, o) {
      s.write(b.toString('binary', 0, o), 'binary');
    } : flush;

  var len = 0;

  switch (typeof v) {
    case 'undefined':
      return strtok.UINT8.put(b, bo, types.NULL, flush);

    case 'boolean':
      return strtok.UINT8.put(b, bo, (v) ? types.TRUE : types.FALSE, flush);

    case 'number':
      var encodeNumberAsHuge = false;

      // Useful for debugging FPN: http://www.binaryconvert.com/

      if (~~v === v) {
        if (-128 <= v && v <= 127) {
          len  = strtok.UINT8.put(b, bo, types.BYTE, flush);
          len += strtok.INT8.put(b, bo + len, v, flush);
        } else if (-32428 <= v && v <= 32427) {
          len  = strtok.UINT8.put(b, bo, types.INT16, flush);
          len += strtok.INT16_BE.put(b, bo + len, v, flush);
        } else if (-2147483648 <= v && v <= 2147483647) {
          len  = strtok.UINT8.put(b, bo, types.INT32, flush);
          len += strtok.INT32_BE.put(b, bo + len, v, flush);
        } else {
          encodeNumberAsHuge = true;
        }
      } else {
        var absV = Math.abs(v);

        if (1.18e-38 < absV && absV < 3.40e38) {
          len  = strtok.UINT8.put(b, bo + len, types.FLOAT, flush);
          len += strtok.FLOAT_BE.put(b, bo + len, v, flush);
        } else if (2.23e-308 < absV && absV < 1.79e308) {
          len  = strtok.UINT8.put(b, bo + len, types.DOUBLE, flush);
          len += strtok.DOUBLE_BE.put(b, bo + len, v, flush);
        } else {
          encodeNumberAsHuge = true;
        }
      }

      if (encodeNumberAsHuge) {
        var stringV = v.toString();

        // 255 = 0xFF is valid for huges
        if (stringV.length <= 255) {
          len  = strtok.UINT8.put(b, bo, types.SHORTHUGE, flush);
          len += strtok.UINT8.put(b, bo + len, stringV.length, flush);
        } else {
          len  = strtok.UINT8.put(b, bo, types.HUGE, flush);
          len += strtok.UINT32_BE.put(b, bo + len, stringV.length, flush);
        }

        len += b.write(stringV, bo + len, 'utf-8');
      }

      return len;

    case 'string':
      var stringByteLength = Buffer.byteLength(v, 'utf-8');

      // 255 = 0xFF is valid for strings
      if (stringByteLength <= 255) {
        len  = strtok.UINT8.put(b, bo, types.SHORTSTRING, flush);
        len += strtok.UINT8.put(b, bo + len, stringByteLength, flush);
      } else {
        len  = strtok.UINT8.put(b, bo, types.STRING, flush);
        len += strtok.UINT32_BE.put(b, bo + len, stringByteLength, flush);
      }

      len += b.write(v, bo + len, 'utf-8');

      return len;

    case 'object':
      if (v === null) {
        len = strtok.UINT8.put(b, bo, types.NULL, flush);
      } else if (Array.isArray(v)) {
        // 255 = 0xFF is reserved fo unknown-length containers
        if (v.length <= 254) {
          len  = strtok.UINT8.put(b, bo, types.SHORTARRAY, flush);
          len += strtok.UINT8.put(b, bo + len, v.length, flush);
        } else {
          len  = strtok.UINT8.put(b, bo, types.ARRAY, flush);
          len += strtok.UINT32_BE.put(b, bo + len, v.length, flush);
        }

        v.forEach(function(vv) {
          len += ubjsonStrtokPack(s, b, bo + len, vv, flush);
        });
      } else {
        var vk = Object.keys(v);

        // 255 = 0xFF is reserved fo unknown-length containers
        if (vk.length <= 254) {
          len = strtok.UINT8.put(b, bo, types.SHORTOBJECT, flush);
          len += strtok.UINT8.put(b, bo + len, vk.length, flush);
        } else {
          len = strtok.UINT8.put(b, bo, types.OBJECT, flush);
          len += strtok.UINT32_BE.put(b, bo + len, vk.length, flush);
        }

        vk.forEach(function(k) {
          len += ubjsonStrtokPack(s, b, bo + len, k, flush);
          len += ubjsonStrtokPack(s, b, bo + len, v[k], flush);
        });
      }

      return len;

    default:
      throw new Error('Cannot handle object of type ' + typeof v);
  }
}

/*!
 * Internal function
 */
function packToBufferWithOffsetSync(value, buffer, bufferOffset) {
  return ubjsonStrtokPack(
    undefined /* stream */,
    buffer /* buf */, bufferOffset /* buf offset */, value /* value */,
    undefined /* flush */
  );
}

function packToBufferSync(value, buffer) {
  return packToBufferWithOffsetSync(value, buffer, 0);
}

function packToBuffer(value, buffer, callback) {
  var offset = packToBufferWithOffsetSync(value, buffer, 0);

  process.nextTick(function() {
      callback(offset);
  });
}

var packToStreamInternalBuffer = new Buffer(1024);

function packToStream(value, stream) {
  var flush = function(b, bo) {
    stream.write(b.toString('binary', 0, bo), 'binary');
  };

  var off = ubjsonStrtokPack(
    stream /* stream */,
    packToStreamInternalBuffer /* buf */, 0 /* buf offset */, value /* value */,
    flush  /* flush */
  );

  flush(packToStreamInternalBuffer, off);
}

// Export public functions

/**
 * UBJSON
 *
 * Functions, exported from Node.js `ubjson` module.
 **/
/**
 * UBJSON.unpackBuffer(buffer, callback)
 * - buffer (Buffer): Buffer to unpack
 * - callback (Function): Callback, gets JavaScript value
 *
 * Unpacks buffer with UBJSON data into JavaScript value.
 **/
exports.unpackBuffer = unpackBuffer;

/**
 * UBJSON.packToBuffer(value, buffer, callback)
 * - value (mixed): Value to pack
 * - buffer (Buffer): Buffer to resulting UBJSON data
 * - callback (Function): Callback, gets buffer offset
 *
 * Packs JavaScript value into UBJSON.
 **/
exports.packToBuffer = packToBuffer;

/**
 * UBJSON.packToBufferSync(value, buffer) -> Integer
 * - value (mixed): Value to pack
 * - buffer (Buffer): Buffer to resulting UBJSON data
 *
 * Synchronous [[UBJSON.packToBuffer]]. Returns buffer offset.
 **/
exports.packToBufferSync = packToBufferSync;

/**
 * UBJSON.packToStream(value, stream)
 * - value (mixed): Value to pack
 * - stream (WritableStream): Stream to write packed UBJSON
 *
 * Pack JavaScript value into UBJSON and write to stream.
 **/
exports.packToStream = packToStream;
