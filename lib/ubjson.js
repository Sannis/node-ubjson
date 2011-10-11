/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;
var sys = require('sys');

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
types.ARRAY = 'A';

// Prepare types hash to use

var typesKeys = Object.getOwnPropertyNames(types);

typesKeys.forEach(function(typeKey) {
  types[typeKey] = types[typeKey].charCodeAt(0);
});

// Generator function for handing to strtok.parse(); takes an accumulator
// callback to invoke when a top-level type is read from the stream
function strtokUbjsonParser(acc) {
  // Type that we're in when reading a value
  var type = undefined;

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
        if (v == types.NULL) {
          acc(null);
          break;
        }

        // true
        if (v == types.TRUE) {
          acc(true);
          break;
        }

        // false
        if (v == types.FALSE) {
          acc(false);
          break;
        }

        // array16
        if (v == types.SHORTARRAY) {
          type = types.SHORTARRAY;
          return strtok.UINT8;
        }

        // array32
        if (v == types.ARRAY) {
          type = types.ARRAY;
          return strtok.UINT32_BE;
        }

        console.error('unexpected type: ' + v + '; aborting');
        return strtok.DONE;

      case types.SHORTARRAY:
      case types.ARRAY:
        acc = unpackArray(v, acc);
        type = undefined;
        break;
    }

    // We're reading a new primitive; go get it
    return strtok.UINT8;
  };
}

// A mock stream implementation that breaks up provided data into
// random-sized chunks and emits 'data' events. This is used to simulate
// data arriving with arbitrary packet boundaries.
function SourceStream(buffer) {
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
                self.emit('end')
            });
        }

        self.emit('data', b);
    };

    process.nextTick(emitData);
}
sys.inherits(SourceStream, EventEmitter);

function unpack(buffer, callback) {
  var stream = new SourceStream(buffer);

  var strtokUbjsonParserObject = new strtokUbjsonParser(function (v) {
    callback(v);
  });

  strtok.parse(stream, strtokUbjsonParserObject);
}

var PACKBUF = new Buffer(1024);

// Pack a value into the given stream (or buffer and offset),
// flushing using the provided function.
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
      return strtok.UINT8.put(b, bo, types.NULL, flush);

    case 'boolean':
      return strtok.UINT8.put(b, bo, (v) ? types.TRUE : types.FALSE, flush);

    case 'object':
      var len = 0;

      if (v === null) {
        return strtok.UINT8.put(b, bo, types.NULL, flush);
      } else if (Array.isArray(v)) {
        if (v.length <= 254) {
          len  = strtok.UINT8.put(b, bo, types.SHORTARRAY, flush);
          len += strtok.UINT8.put(b, bo + len, v.length, flush);
        } else {
          len  = strtok.UINT8.put(b, bo, types.ARRAY, flush);
          len += strtok.UINT32_BE.put(b, bo + len, v.length, flush);
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

function pack(value, callback) {
  var size = 1024;
  var buffer = new Buffer(size);
  var offset = offsetPack(buffer, 0, value);

  var returnBuffer = new Buffer(offset);
  buffer.copy(returnBuffer, 0, 0, offset);
  buffer = null;

  callback(returnBuffer);
}

// Export public functions
//exports.strtokUbjsonParser = strtokUbjsonParser;
exports.unpack = unpack;


//exports.generalPack = generalPack;
//exports.offsetPack = offsetPack;
exports.pack = pack;
