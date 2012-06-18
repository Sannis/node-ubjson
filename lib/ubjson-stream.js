/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

// Require dependencies
var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var strtok = require('strtok');

// Require UBJSON parser and packer
var UbjsonParser = require("./ubjson-parser.js");
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
  var sendBuffer = null;

  // Writable stream?
  if (typeof stream.write === "function" && stream.writable) {
    /**
     * UbjsonStream#send(value) -> Integer
     * - value (mixed): JavaScript value to send
     *
     * Sends an UBJSON-packed value down the stream.
     *
     * Returns underlying stream `write` method calls result.
     **/
    self.send = function (value) {
      // Check for send buffer
      if (!(sendBuffer instanceof Buffer)) {
        sendBuffer = new Buffer(1024);
      }

      var flush = function(buffer, offset) {
        return stream.write(buffer.toString('binary', 0, offset), 'binary');
      };

      var offset = ubjsonPack(
        stream /* stream */,
        sendBuffer /* buffer */, 0 /* buffer offset */, value /* value */,
        flush  /* flush */
      );

      return flush(sendBuffer, offset);
    };
  }

  // Readable stream?
  if (typeof stream.on === "function" && stream.readable) {
    // Pass all data received by stream to UBJSON parser
    var ubjsonStrtokParser = new UbjsonParser(function (value) {
      /**
       * UbjsonStream@value(value)
       * - value (mixed): Received JavaScript value
       *
       * Emits on value read from underlying stream.
       *
       * Available only for readable streams.
       **/
      self.emit('value', value);
    });

    strtok.parse(stream, ubjsonStrtokParser);

      /**
       * UbjsonStream@end()
       *
       * Emits on underlying stream `end` event.
       *
       * Available only for readable streams.
       **/
    stream.on("end", function () {
      self.emit('end');
    });
  }
}
// Inheritance
util.inherits(UbjsonStream, EventEmitter);

// Export
module.exports = UbjsonStream;
