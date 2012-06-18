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

  var ubjsonStrtokParser = new UbjsonParser(function (v) {
    callback(v);
  });

  strtok.parse(stream, ubjsonStrtokParser);
}

/*!
 * Internal functions
 */
function packToBufferWithOffsetSync(value, buffer, bufferOffset) {
  return ubjsonPack(
    null /* stream */,
    buffer /* buf */, bufferOffset /* buf offset */, value /* value */,
    null /* flush */
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

  var off = ubjsonPack(
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

/** alias of: UbjsonStream
 * class UBJSON.Stream < EventEmitter
 **/
exports.Stream = UbjsonStream;
