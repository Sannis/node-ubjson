/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

// Require dependencies
var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Require UBJSON pack function
var ubjsonPack = require("./ubjson-pack.js");

/**
 * class UbjsonStream < EventEmitter
 *
 * Makes possible to send and receive UBJSON data through streams.
 **/

/**
 * new UbjsonStream(stream)
 * - s (stream): Stream to write and read UBJSON data
 **/
function UbjsonStream(stream) {
  // Inheritance
  EventEmitter.call(this);

  // Save `this` for in closure
  var self = this;

  // Used to pack value to UBJSON by `ubjsonPack`
  self.sendBuffer = null;

  /**
   * UbjsonStream#send(value) -> Integer
   * - v (mixed): JavaScript value to send
   *
   * Sends an UBJSON-packed value down the stream.
   *
   * Returns underlying stream `write` method calls result.
   **/
  self.send = function (value) {
    // Check for send buffer
    if (!(self.sendBuffer instanceof Buffer)) {
      self.sendBuffer = new Buffer(1024);
    }

    var flush = function(buffer, offset) {
      return stream.write(buffer.toString('binary', 0, offset), 'binary');
    };

    var offset = ubjsonPack(
      stream /* stream */,
      self.sendBuffer /* buffer */, 0 /* buffer offset */, value /* value */,
      flush  /* flush */
    );

    return flush(self.sendBuffer, offset);
  };
}
// Inheritance
util.inherits(UbjsonStream, EventEmitter);

// Export
module.exports = UbjsonStream;
