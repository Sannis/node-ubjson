
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
})('lib/ubjson-stream.js', [8,9,10,11,12,15,16,19,22,147,152,155,165,38,41,44,47,59,81,84,65,69,75,62,66,82,85,90,92,99,132,134,101,106,108,118,128,142,153,156,161], {"50_6_53":0,"50_6_34":0,"50_44_15":0,"61_10_31":0,"97_6_50":0,"97_6_31":0,"97_41_15":0,"100_10_22":0}, ["/*!"," * Copyright by Oleg Efimov"," *"," * See license text in LICENSE file"," */","","// Require dependencies","var Buffer = require('buffer').Buffer;","var EventEmitter = require('events').EventEmitter;","var assert = require('assert');","var util = require('util');","var strtok = require('strtok');","","// Require UBJSON parser and packer","var UbjsonParser = require(\"./ubjson-parser.js\");","var ubjsonPack = require(\"./ubjson-pack.js\");","","// Send buffer length in bytes,","var defaultSendBufferLength = 1024;","","// Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double","var minSendBufferLength = 8;","","/** section: Classes"," * class UbjsonStream < EventEmitter"," *"," * Makes possible to send and receive UBJSON data through streams."," **/","","/**"," * new UbjsonStream(stream)"," * - stream (Stream): Stream to write and read UBJSON data."," *"," * Constructs an UbjsonStream instance, use `stream` for read or/and write packed data."," **/","function UbjsonStream(stream) {","  // Inheritance","  EventEmitter.call(this);","","  // Save `this` for in closure","  var self = this;","","  // Used to pack value to UBJSON by `ubjsonPack`","  var sendBuffer = null;","","  // Send buffer length for this stream","  var sendBufferLength = defaultSendBufferLength;","","  // Writable stream?","  if (typeof stream.write === \"function\" && stream.writable) {","    /**","     * UbjsonStream#send(value) -> Integer","     * - value (mixed): JavaScript value to send","     *","     * Sends an UBJSON-packed value down the stream.","     *","     * Returns underlying stream `write` method calls result.","     **/","    self.send = function (value) {","      // Check for send buffer","      if (!(sendBuffer instanceof Buffer)) {","        sendBuffer = new Buffer(sendBufferLength);","      }","","      var flush = function(buffer, offset) {","        return stream.write(buffer.toString('binary', 0, offset), 'binary');","      };","","      var offset = ubjsonPack(","        stream /* stream */,","        sendBuffer /* buffer */, 0 /* buffer offset */, value /* value */,","        flush  /* flush */","      );","","      return flush(sendBuffer, offset);","    };","","    /**","     * UbjsonStream#sendBufferLength -> Integer","     **/","    self.__defineGetter__('sendBufferLength', function () {","      return sendBufferLength;","    });","    self.__defineSetter__('sendBufferLength', function (newSendBufferLength) {","      assert.ok(","        newSendBufferLength >= minSendBufferLength,","        \"Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double\"","      );","","      sendBufferLength = newSendBufferLength;","","      sendBuffer = new Buffer(sendBufferLength);","    });","  }","","  // Readable stream?","  if (typeof stream.on === \"function\" && stream.readable) {","    // Pass all data received by stream to UBJSON parser","    var ubjsonStrtokParser = new UbjsonParser(function (value) {","      if (value instanceof Error) {","        stream.removeAllListeners('data');","","        // Pump remaining data back through the stream;","        // the protocol layer will have set up listeners","        // for this event if it cares about the remaining data.","        stream.emit('data', value.remainingData);","","        delete value.remainingData;","","        /**","         * UbjsonStream@error(error)","         * - error (Error): Received error","         *","         * Emits on parse error.","         *","         * Available only for readable streams.","         **/","        self.emit('error', value);","      } else {","        /**","         * UbjsonStream@value(value)","         * - value (mixed): Received JavaScript value","         *","         * Emits on value read from underlying stream.","         *","         * Available only for readable streams.","         **/","        self.emit('value', value);","      }","    });","","    strtok.parse(stream, ubjsonStrtokParser);","","    stream.on(\"end\", function () {","      /**","       * UbjsonStream@end()","       *","       * Emits on underlying stream `end` event.","       *","       * Available only for readable streams.","       **/","      self.emit('end');","    });","  }","}","// Inheritance","util.inherits(UbjsonStream, EventEmitter);","","/**"," * UbjsonStream.defaultSendBufferLength -> Integer"," **/","UbjsonStream.__defineGetter__('defaultSendBufferLength', function () {","  return defaultSendBufferLength;","});","UbjsonStream.__defineSetter__('defaultSendBufferLength', function (newDefaultSendBufferLength) {","  assert.ok(","    newDefaultSendBufferLength >= minSendBufferLength,","    \"Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double\"","  );","","  defaultSendBufferLength = newDefaultSendBufferLength;","});","","// Export","module.exports = UbjsonStream;",""]);
/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */
// Require dependencies
_$jscmd("lib/ubjson-stream.js", "line", 8);

var Buffer = require("buffer").Buffer;

_$jscmd("lib/ubjson-stream.js", "line", 9);

var EventEmitter = require("events").EventEmitter;

_$jscmd("lib/ubjson-stream.js", "line", 10);

var assert = require("assert");

_$jscmd("lib/ubjson-stream.js", "line", 11);

var util = require("util");

_$jscmd("lib/ubjson-stream.js", "line", 12);

var strtok = require("strtok");

_$jscmd("lib/ubjson-stream.js", "line", 15);

// Require UBJSON parser and packer
var UbjsonParser = require("./ubjson-parser.js");

_$jscmd("lib/ubjson-stream.js", "line", 16);

var ubjsonPack = require("./ubjson-pack.js");

_$jscmd("lib/ubjson-stream.js", "line", 19);

// Send buffer length in bytes,
var defaultSendBufferLength = 1024;

_$jscmd("lib/ubjson-stream.js", "line", 22);

// Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double
var minSendBufferLength = 8;

/** section: Classes
 * class UbjsonStream < EventEmitter
 *
 * Makes possible to send and receive UBJSON data through streams.
 **/
/**
 * new UbjsonStream(stream)
 * - stream (Stream): Stream to write and read UBJSON data.
 *
 * Constructs an UbjsonStream instance, use `stream` for read or/and write packed data.
 **/
function UbjsonStream(stream) {
    _$jscmd("lib/ubjson-stream.js", "line", 38);
    // Inheritance
    EventEmitter.call(this);
    _$jscmd("lib/ubjson-stream.js", "line", 41);
    // Save `this` for in closure
    var self = this;
    _$jscmd("lib/ubjson-stream.js", "line", 44);
    // Used to pack value to UBJSON by `ubjsonPack`
    var sendBuffer = null;
    _$jscmd("lib/ubjson-stream.js", "line", 47);
    // Send buffer length for this stream
    var sendBufferLength = defaultSendBufferLength;
    // Writable stream?
    if (_$jscmd("lib/ubjson-stream.js", "cond", "50_6_53", _$jscmd("lib/ubjson-stream.js", "cond", "50_6_34", typeof stream.write === "function") && _$jscmd("lib/ubjson-stream.js", "cond", "50_44_15", stream.writable))) {
        _$jscmd("lib/ubjson-stream.js", "line", 59);
        /**
     * UbjsonStream#send(value) -> Integer
     * - value (mixed): JavaScript value to send
     *
     * Sends an UBJSON-packed value down the stream.
     *
     * Returns underlying stream `write` method calls result.
     **/
        self.send = function(value) {
            // Check for send buffer
            if (_$jscmd("lib/ubjson-stream.js", "cond", "61_10_31", !(sendBuffer instanceof Buffer))) {
                _$jscmd("lib/ubjson-stream.js", "line", 62);
                sendBuffer = new Buffer(sendBufferLength);
            }
            _$jscmd("lib/ubjson-stream.js", "line", 65);
            var flush = function(buffer, offset) {
                _$jscmd("lib/ubjson-stream.js", "line", 66);
                return stream.write(buffer.toString("binary", 0, offset), "binary");
            };
            _$jscmd("lib/ubjson-stream.js", "line", 69);
            var offset = ubjsonPack(stream, sendBuffer, 0, value, flush);
            _$jscmd("lib/ubjson-stream.js", "line", 75);
            return flush(sendBuffer, offset);
        };
        _$jscmd("lib/ubjson-stream.js", "line", 81);
        /**
     * UbjsonStream#sendBufferLength -> Integer
     **/
        self.__defineGetter__("sendBufferLength", function() {
            _$jscmd("lib/ubjson-stream.js", "line", 82);
            return sendBufferLength;
        });
        _$jscmd("lib/ubjson-stream.js", "line", 84);
        self.__defineSetter__("sendBufferLength", function(newSendBufferLength) {
            _$jscmd("lib/ubjson-stream.js", "line", 85);
            assert.ok(newSendBufferLength >= minSendBufferLength, "Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double");
            _$jscmd("lib/ubjson-stream.js", "line", 90);
            sendBufferLength = newSendBufferLength;
            _$jscmd("lib/ubjson-stream.js", "line", 92);
            sendBuffer = new Buffer(sendBufferLength);
        });
    }
    // Readable stream?
    if (_$jscmd("lib/ubjson-stream.js", "cond", "97_6_50", _$jscmd("lib/ubjson-stream.js", "cond", "97_6_31", typeof stream.on === "function") && _$jscmd("lib/ubjson-stream.js", "cond", "97_41_15", stream.readable))) {
        _$jscmd("lib/ubjson-stream.js", "line", 99);
        // Pass all data received by stream to UBJSON parser
        var ubjsonStrtokParser = new UbjsonParser(function(value) {
            if (_$jscmd("lib/ubjson-stream.js", "cond", "100_10_22", value instanceof Error)) {
                _$jscmd("lib/ubjson-stream.js", "line", 101);
                stream.removeAllListeners("data");
                _$jscmd("lib/ubjson-stream.js", "line", 106);
                // Pump remaining data back through the stream;
                // the protocol layer will have set up listeners
                // for this event if it cares about the remaining data.
                stream.emit("data", value.remainingData);
                _$jscmd("lib/ubjson-stream.js", "line", 108);
                delete value.remainingData;
                _$jscmd("lib/ubjson-stream.js", "line", 118);
                /**
         * UbjsonStream@error(error)
         * - error (Error): Received error
         *
         * Emits on parse error.
         *
         * Available only for readable streams.
         **/
                self.emit("error", value);
            } else {
                _$jscmd("lib/ubjson-stream.js", "line", 128);
                /**
         * UbjsonStream@value(value)
         * - value (mixed): Received JavaScript value
         *
         * Emits on value read from underlying stream.
         *
         * Available only for readable streams.
         **/
                self.emit("value", value);
            }
        });
        _$jscmd("lib/ubjson-stream.js", "line", 132);
        strtok.parse(stream, ubjsonStrtokParser);
        _$jscmd("lib/ubjson-stream.js", "line", 134);
        stream.on("end", function() {
            _$jscmd("lib/ubjson-stream.js", "line", 142);
            /**
       * UbjsonStream@end()
       *
       * Emits on underlying stream `end` event.
       *
       * Available only for readable streams.
       **/
            self.emit("end");
        });
    }
}

_$jscmd("lib/ubjson-stream.js", "line", 147);

// Inheritance
util.inherits(UbjsonStream, EventEmitter);

_$jscmd("lib/ubjson-stream.js", "line", 152);

/**
 * UbjsonStream.defaultSendBufferLength -> Integer
 **/
UbjsonStream.__defineGetter__("defaultSendBufferLength", function() {
    _$jscmd("lib/ubjson-stream.js", "line", 153);
    return defaultSendBufferLength;
});

_$jscmd("lib/ubjson-stream.js", "line", 155);

UbjsonStream.__defineSetter__("defaultSendBufferLength", function(newDefaultSendBufferLength) {
    _$jscmd("lib/ubjson-stream.js", "line", 156);
    assert.ok(newDefaultSendBufferLength >= minSendBufferLength, "Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double");
    _$jscmd("lib/ubjson-stream.js", "line", 161);
    defaultSendBufferLength = newDefaultSendBufferLength;
});

_$jscmd("lib/ubjson-stream.js", "line", 165);

// Export
module.exports = UbjsonStream;