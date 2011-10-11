/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var Buffer = require('buffer').Buffer;
var strtok = require('../node_modules/strtok/lib/strtok.js');

var types = {};

// General types
types.NULL = 'Z';

// Boolean types
types.TRUE = 'T';
types.FALSE = 'F';

// String types
//types.SHORTSTRING = 's';
//types.STRING = 'S';

// Array types
types.SHORTARRAY = 'a';

// Prepare types hash to use

var typesKeys = Object.getOwnPropertyNames(types);

typesKeys.forEach(function(typeKey) {
  types[typeKey] = types[typeKey].charCodeAt(0);
});

// Private functions

var PACKBUF = new Buffer(1024);

// Pack a value into the given stream (or buffer and offset), flushing using
// the provided function.
function generalPack(s, b, bo, v, flush) {
  b = (b === undefined) ? PACKBUF : b;
  bo = (bo === undefined) ? 0 : bo;
  v = (v === null) ? undefined : v;
  flush = (flush === undefined && s !== undefined) ?
    function(b, o) {
      s.write(b.toString('binary', 0, o), 'binary');
    } : flush;

  switch (typeof v) {
    case 'undefined':
      return strtok.INT8.put(b, bo, types.NULL, flush);

    case 'boolean':
      return strtok.INT8.put(b, bo, (v) ? types.TRUE : types.FALSE, flush);

      throw new Error('Cannot handle 64-bit numbers');

    case 'object':
      var len = 0;

      if (v === null) {
        return strtok.INT8.put(b, bo, types.NULL, flush);
      } else if (Array.isArray(v)) {
        if (v.length <= 254) {
          // fix array
          len  = strtok.INT8.put(b, bo, types.SHORTARRAY, flush);
          len += strtok.UINT8.put(b, bo + len, v.length, flush);
        } else {
          throw new Error('Array too large for serialization!');
        }

        v.forEach(function(vv) {
          len += generalPack(s, b, bo + len, vv, flush);
        });
      }

      return len;

    default:
      throw new Error('Cannot handle object of type ' + typeof v);
  }
}

function offsetPack(b, bo, v) {
  return generalPack(undefined /* stream */, b, bo, v, undefined /* flush */);
}

// Public functions

function pack(value) {
  var size = 255;
  var buffer = new Buffer(size);
  var offset = offsetPack(buffer, 0, value);

  var returnBuffer = new Buffer(offset);
  buffer.copy(returnBuffer, 0, 0, offset);
  delete buffer;

  return returnBuffer.toString('binary');
}

function unpack(value) {
  // Nothing yet here
}

// Export public functions
//exports.generalPack = generalPack;
//exports.offsetPack = offsetPack;
exports.pack = pack;

exports.unpack = unpack;
