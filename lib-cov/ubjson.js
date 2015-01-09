
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
})('lib/ubjson.js', [8,9,10,11,14,17,18,19,22,24,67,139,149,158,169,174,26,27,30,31,39,41,43,65,44,46,62,49,51,53,55,57,58,70,72,92,74,75,77,82,78,79,83,85,88,99,107,112,114,115,118,119], {"25_4_19":0,"48_12_19":0,"73_8_22":0}, ["/*!"," * Copyright by Oleg Efimov"," *"," * See license text in LICENSE file"," */","","// Require dependencies","var Buffer = require('buffer').Buffer;","var EventEmitter = require('events').EventEmitter;","var util = require('util');","var strtok = require('strtok');","","// Extend `strtok` for reading/writing float and double numbers","require('./strtok-extend.js');","","// Require UBJSON parser, packer and stream","var UbjsonParser = require(\"./ubjson-parser.js\");","var ubjsonPack = require(\"./ubjson-pack.js\");","var UbjsonStream = require(\"./ubjson-stream.js\");","","// Require class for int64 storing","var Int64 = require('./int64.js');","","var mySetImmediate;","if (global.setImmediate) {","  mySetImmediate = function (callback) {","    setImmediate(callback);","  };","} else {","  mySetImmediate = function (callback) {","    process.nextTick(callback);","  };","}","","// A mock stream implementation that breaks up provided data into","// 1-byte chunks and emits 'data' events. This is used to simulate","// data arriving with arbitrary packet boundaries.","function BufferStream(buffer) {","    EventEmitter.call(this);","","    var self = this;","","    var emitData = function() {","        var len = 1;","","        var b;","","        if (len < buffer.length) {","            b = buffer.slice(0, len);","","            buffer = buffer.slice(len, buffer.length);","","            mySetImmediate(emitData);","        } else {","            b = buffer.slice(0, buffer.length);","","            mySetImmediate(function() {","                self.emit('end');","            });","        }","","        self.emit('data', b);","    };","","    mySetImmediate(emitData);","}","util.inherits(BufferStream, EventEmitter);","","function unpackBuffer(buffer, callback) {","  var stream = new BufferStream(buffer);","","  var ubjsonStrtokParser = new UbjsonParser(function (value) {","    if (value instanceof Error) {","      var remainingData = new Buffer(buffer.length);","      var remainingDataLength = 0;","","      stream.on('data', function (data) {","        data.copy(remainingData, remainingDataLength);","        remainingDataLength += data.length;","      });","","      stream.on('end', function () {","        value.remainingData = remainingData.slice(0, remainingDataLength);","","        callback(value);","      });","    } else {","      callback(null, value);","    }","  });","","  strtok.parse(stream, ubjsonStrtokParser);","}","","/*!"," * Internal functions"," */","function packToBufferWithOffsetSync(value, buffer, bufferOffset) {","  return ubjsonPack(","    null /* stream */,","    buffer /* buffer */, bufferOffset /* buffer offset */, value /* value */,","    null /* flush */","  );","}","","function packToBufferSync(value, buffer) {","  return packToBufferWithOffsetSync(value, buffer, 0);","}","","function packToBuffer(value, buffer, callback) {","  try {","    var offset = packToBufferSync(value, buffer);","","    mySetImmediate(function() {","      callback(null, offset);","    });","  } catch (e) {","    mySetImmediate(function() {","      callback(e);","    });","  }","}","","// Export public functions","","/**"," * UBJSON"," *"," * Functions and classes, exported from Node.js `ubjson` module."," **/","","/**"," * UBJSON.unpackBuffer(buffer, callback)"," * - buffer (Buffer): Buffer to unpack"," * - callback (Function): Callback, gets JavaScript value"," *"," * Unpacks buffer with UBJSON data into JavaScript value."," **/","exports.unpackBuffer = unpackBuffer;","","/**"," * UBJSON.packToBuffer(value, buffer, callback)"," * - value (mixed): Value to pack"," * - buffer (Buffer): Buffer to resulting UBJSON data"," * - callback (Function): Callback, gets buffer (error, offset)"," *"," * Packs JavaScript value into UBJSON."," **/","exports.packToBuffer = packToBuffer;","","/**"," * UBJSON.packToBufferSync(value, buffer) -> Integer"," * - value (mixed): Value to pack"," * - buffer (Buffer): Buffer to resulting UBJSON data"," *"," * Synchronous [[UBJSON.packToBuffer]]. Returns buffer offset."," **/","exports.packToBufferSync = packToBufferSync;","","/**"," * == Classes =="," *"," * Exported classes."," **/","","/** alias of: UbjsonStream"," * class UBJSON.Stream < EventEmitter"," **/","exports.Stream = UbjsonStream;","","/** alias of: Int64"," * class UBJSON.Int64"," **/","exports.Int64 = Int64;",""]);
/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */
// Require dependencies
_$jscmd("lib/ubjson.js", "line", 8);

var Buffer = require("buffer").Buffer;

_$jscmd("lib/ubjson.js", "line", 9);

var EventEmitter = require("events").EventEmitter;

_$jscmd("lib/ubjson.js", "line", 10);

var util = require("util");

_$jscmd("lib/ubjson.js", "line", 11);

var strtok = require("strtok");

_$jscmd("lib/ubjson.js", "line", 14);

// Extend `strtok` for reading/writing float and double numbers
require("./strtok-extend.js");

_$jscmd("lib/ubjson.js", "line", 17);

// Require UBJSON parser, packer and stream
var UbjsonParser = require("./ubjson-parser.js");

_$jscmd("lib/ubjson.js", "line", 18);

var ubjsonPack = require("./ubjson-pack.js");

_$jscmd("lib/ubjson.js", "line", 19);

var UbjsonStream = require("./ubjson-stream.js");

_$jscmd("lib/ubjson.js", "line", 22);

// Require class for int64 storing
var Int64 = require("./int64.js");

_$jscmd("lib/ubjson.js", "line", 24);

var mySetImmediate;

if (_$jscmd("lib/ubjson.js", "cond", "25_4_19", global.setImmediate)) {
    _$jscmd("lib/ubjson.js", "line", 26);
    mySetImmediate = function(callback) {
        _$jscmd("lib/ubjson.js", "line", 27);
        setImmediate(callback);
    };
} else {
    _$jscmd("lib/ubjson.js", "line", 30);
    mySetImmediate = function(callback) {
        _$jscmd("lib/ubjson.js", "line", 31);
        process.nextTick(callback);
    };
}

// A mock stream implementation that breaks up provided data into
// 1-byte chunks and emits 'data' events. This is used to simulate
// data arriving with arbitrary packet boundaries.
function BufferStream(buffer) {
    _$jscmd("lib/ubjson.js", "line", 39);
    EventEmitter.call(this);
    _$jscmd("lib/ubjson.js", "line", 41);
    var self = this;
    _$jscmd("lib/ubjson.js", "line", 43);
    var emitData = function() {
        _$jscmd("lib/ubjson.js", "line", 44);
        var len = 1;
        _$jscmd("lib/ubjson.js", "line", 46);
        var b;
        if (_$jscmd("lib/ubjson.js", "cond", "48_12_19", len < buffer.length)) {
            _$jscmd("lib/ubjson.js", "line", 49);
            b = buffer.slice(0, len);
            _$jscmd("lib/ubjson.js", "line", 51);
            buffer = buffer.slice(len, buffer.length);
            _$jscmd("lib/ubjson.js", "line", 53);
            mySetImmediate(emitData);
        } else {
            _$jscmd("lib/ubjson.js", "line", 55);
            b = buffer.slice(0, buffer.length);
            _$jscmd("lib/ubjson.js", "line", 57);
            mySetImmediate(function() {
                _$jscmd("lib/ubjson.js", "line", 58);
                self.emit("end");
            });
        }
        _$jscmd("lib/ubjson.js", "line", 62);
        self.emit("data", b);
    };
    _$jscmd("lib/ubjson.js", "line", 65);
    mySetImmediate(emitData);
}

_$jscmd("lib/ubjson.js", "line", 67);

util.inherits(BufferStream, EventEmitter);

function unpackBuffer(buffer, callback) {
    _$jscmd("lib/ubjson.js", "line", 70);
    var stream = new BufferStream(buffer);
    _$jscmd("lib/ubjson.js", "line", 72);
    var ubjsonStrtokParser = new UbjsonParser(function(value) {
        if (_$jscmd("lib/ubjson.js", "cond", "73_8_22", value instanceof Error)) {
            _$jscmd("lib/ubjson.js", "line", 74);
            var remainingData = new Buffer(buffer.length);
            _$jscmd("lib/ubjson.js", "line", 75);
            var remainingDataLength = 0;
            _$jscmd("lib/ubjson.js", "line", 77);
            stream.on("data", function(data) {
                _$jscmd("lib/ubjson.js", "line", 78);
                data.copy(remainingData, remainingDataLength);
                _$jscmd("lib/ubjson.js", "line", 79);
                remainingDataLength += data.length;
            });
            _$jscmd("lib/ubjson.js", "line", 82);
            stream.on("end", function() {
                _$jscmd("lib/ubjson.js", "line", 83);
                value.remainingData = remainingData.slice(0, remainingDataLength);
                _$jscmd("lib/ubjson.js", "line", 85);
                callback(value);
            });
        } else {
            _$jscmd("lib/ubjson.js", "line", 88);
            callback(null, value);
        }
    });
    _$jscmd("lib/ubjson.js", "line", 92);
    strtok.parse(stream, ubjsonStrtokParser);
}

/*!
 * Internal functions
 */
function packToBufferWithOffsetSync(value, buffer, bufferOffset) {
    _$jscmd("lib/ubjson.js", "line", 99);
    return ubjsonPack(null, buffer, bufferOffset, value, null);
}

function packToBufferSync(value, buffer) {
    _$jscmd("lib/ubjson.js", "line", 107);
    return packToBufferWithOffsetSync(value, buffer, 0);
}

function packToBuffer(value, buffer, callback) {
    try {
        _$jscmd("lib/ubjson.js", "line", 112);
        var offset = packToBufferSync(value, buffer);
        _$jscmd("lib/ubjson.js", "line", 114);
        mySetImmediate(function() {
            _$jscmd("lib/ubjson.js", "line", 115);
            callback(null, offset);
        });
    } catch (e) {
        _$jscmd("lib/ubjson.js", "line", 118);
        mySetImmediate(function() {
            _$jscmd("lib/ubjson.js", "line", 119);
            callback(e);
        });
    }
}

_$jscmd("lib/ubjson.js", "line", 139);

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

_$jscmd("lib/ubjson.js", "line", 149);

/**
 * UBJSON.packToBuffer(value, buffer, callback)
 * - value (mixed): Value to pack
 * - buffer (Buffer): Buffer to resulting UBJSON data
 * - callback (Function): Callback, gets buffer (error, offset)
 *
 * Packs JavaScript value into UBJSON.
 **/
exports.packToBuffer = packToBuffer;

_$jscmd("lib/ubjson.js", "line", 158);

/**
 * UBJSON.packToBufferSync(value, buffer) -> Integer
 * - value (mixed): Value to pack
 * - buffer (Buffer): Buffer to resulting UBJSON data
 *
 * Synchronous [[UBJSON.packToBuffer]]. Returns buffer offset.
 **/
exports.packToBufferSync = packToBufferSync;

_$jscmd("lib/ubjson.js", "line", 169);

/**
 * == Classes ==
 *
 * Exported classes.
 **/
/** alias of: UbjsonStream
 * class UBJSON.Stream < EventEmitter
 **/
exports.Stream = UbjsonStream;

_$jscmd("lib/ubjson.js", "line", 174);

/** alias of: Int64
 * class UBJSON.Int64
 **/
exports.Int64 = Int64;