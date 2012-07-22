/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

// Require dependencies
var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');
var util = require('util');
var strtok = require('strtok');

// Extend `strtok` for reading/writing float and double numbers
require('./strtok-extend.js');

// Require UBJSON parser, packer and stream
var UbjsonParser = require("./ubjson-parser.js");
var ubjsonPack = require("./ubjson-pack.js");
var UbjsonStream = require("./ubjson-stream.js");

// Require class for int64 storing
var Int64 = require('./int64.js');

// A mock stream implementation that breaks up provided data into
// 1-byte chunks and emits 'data' events. This is used to simulate
// data arriving with arbitrary packet boundaries.
function BufferStream(buffer) {
    EventEmitter.call(this);

    var self = this;

    var emitData = function() {
        var len = 1;

        var b;

        if (len < buffer.length) {
            b = buffer.slice(0, len);

            buffer = buffer.slice(len, buffer.length);

            process.nextTick(emitData);
        } else {
            b = buffer.slice(0, buffer.length);

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

  var ubjsonStrtokParser = new UbjsonParser(function (value) {
    if (value instanceof Error) {
      var remainingData = new Buffer(buffer.length);
      var remainingDataLength = 0;

      stream.on('data', function (data) {
        data.copy(remainingData, remainingDataLength);
        remainingDataLength += data.length;
      });

      stream.on('end', function () {
        value.remainingData = remainingData.slice(0, remainingDataLength);

        callback(value);
      });
    } else {
      callback(null, value);
    }
  });

  strtok.parse(stream, ubjsonStrtokParser);
}

/*!
 * Internal functions
 */
function packToBufferWithOffsetSync(value, buffer, bufferOffset) {
  return ubjsonPack(
    null /* stream */,
    buffer /* buffer */, bufferOffset /* buffer offset */, value /* value */,
    null /* flush */
  );
}

function packToBufferSync(value, buffer) {
  return packToBufferWithOffsetSync(value, buffer, 0);
}

function packToBuffer(value, buffer, callback) {
  try {
    var offset = packToBufferSync(value, buffer);

    process.nextTick(function() {
      callback(null, offset);
    });
  } catch (e) {
    process.nextTick(function() {
      callback(e);
    });
  }
}

// Export public functions

/**
 * UBJSON
 *
 * Functions and classes, exported from Node.js `ubjson` module.
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
 * - callback (Function): Callback, gets buffer (error, offset)
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
 * == Classes ==
 *
 * Exported classes.
 **/

/** alias of: UbjsonStream
 * class UBJSON.Stream < EventEmitter
 **/
exports.Stream = UbjsonStream;

/** alias of: Int64
 * class UBJSON.Int64
 **/
exports.Int64 = Int64;
