
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
})('lib/strtok-extend.js', [8,9,10,13,16,27,46,67,98,101,146,23,18,20,30,33,34,35,36,37,38,40,41,43,49,52,53,54,55,56,57,59,60,62,71,77,78,79,80,81,82,83,84,85,86,88,90,91,93,102,104,106,108,112,109,113,114,118,120,121,122,141,125,127,130,131,133,135,137], {"17_6_18":0,"36_16_15":0,"36_35_14":0,"55_16_16":0,"55_36_15":0,"83_16_19":0,"83_39_18":0,"84_16_19":0,"84_39_18":0,"124_8_22":0}, ["/*!"," * Copyright by Oleg Efimov"," *"," * See license text in LICENSE file"," */","","// Require dependencies","var Buffer = require('buffer').Buffer;","var assert = require('assert');","var strtok = require('strtok');","","// Require class for int64 storing","var Int64 = require('./int64.js');","","// Internal function, copypasted from `strtok`","var maybeFlush = function(b, o, len, flush) {","  if (o + len > b.length) {","    flush(b, o);","","    return 0;","  }","","  return o;","};","","// Extend `strtok` for reading/writing float and double numbers","strtok.FLOAT_BE = {","    len : 4,","    get : function(buf, off) {","      return buf.readFloatBE(off);","    },","    put : function(b, o, v, flush) {","      assert.equal(typeof o, 'number');","      assert.equal(typeof v, 'number');","      var absV = Math.abs(v);","      assert.ok(1.18e-38 < absV && absV < 3.40e38);","      assert.ok(o >= 0);","      assert.ok(this.len <= b.length);","","      var no = maybeFlush(b, o, this.len, flush);","      b.writeFloatBE(v, o);","","      return (no - o) + this.len;","    }","};","strtok.DOUBLE_BE = {","    len : 8,","    get : function(buf, off) {","      return buf.readDoubleBE(off);","    },","    put : function(b, o, v, flush) {","      assert.equal(typeof o, 'number');","      assert.equal(typeof v, 'number');","      var absV = Math.abs(v);","      assert.ok(2.23e-308 < absV && absV < 1.79e308);","      assert.ok(o >= 0);","      assert.ok(this.len <= b.length);","","      var no = maybeFlush(b, o, this.len, flush);","      b.writeDoubleBE(v, o);","","      return (no - o) + this.len;","    }","};","","// Extend `strtok` for reading/writing int64 numbers as int32 pairs","strtok.INT64_BE = {","    len : 8,","    get : function(buf, off) {","      // BE!","      return new Int64(","        buf.readInt32BE(off + this.len/2),","        buf.readInt32BE(off)","      );","    },","    put : function(b, o, v, flush) {","      assert.equal(typeof o, 'number');","      assert.ok(v instanceof Int64);","      v = v.toArrayPair();","      assert.equal(v.length, 2);","      assert.equal(typeof v[0], 'number');","      assert.equal(typeof v[1], 'number');","      assert.ok(v[0] >= -2147483648 && v[0] <= 2147483647);","      assert.ok(v[1] >= -2147483648 && v[1] <= 2147483647);","      assert.ok(o >= 0);","      assert.ok(this.len <= b.length);","","      var no = maybeFlush(b, o, this.len, flush);","      // BE!","      b.writeInt32BE(v[1], o);","      b.writeInt32BE(v[0], o + this.len/2);","","      return (no - o) + this.len;","    }","};","","// Needs for UTF8 string splitting to fit buffer byte length","var maxBytesPerUtf8Symbol = 4;","","// Constructor and get method are copypasted from node-strtok","strtok.StringType = function(l, e) {","  var self = this;","","  self.len = l;","","  self.encoding = e;","","  self.get = function(buf, off) {","      return buf.toString(this.encoding, off, off + this.len);","  };","","  self.put = function(buf, off, string, flush) {","    assert.equal(typeof off, 'number');","    assert.equal(typeof string, 'string');","    // Removed for performance, too sanity","    //assert.equal(this.len, Buffer.byteLength(string, 'utf-8'));","","    var newOff = off;","","    var stringPartCharLength = ~~(buf.length/maxBytesPerUtf8Symbol);","    assert.ok(stringPartCharLength > 0);","    var stringPart, stringPartLength;","","    if (this.len <= buf.length) {","      newOff = maybeFlush(buf, newOff, this.len, flush);","","      newOff += buf.write(string, newOff, this.len, this.encoding);","    } else {","      while (string.length > 0) {","        stringPart = string.substring(0, stringPartCharLength);","        stringPartLength = Buffer.byteLength(stringPart, 'utf-8');","","        newOff = maybeFlush(buf, newOff, stringPartLength, flush);","","        newOff += buf.write(stringPart, newOff, stringPartLength, this.encoding);","","        string = string.substring(stringPartCharLength);","      }","    }","","    return (newOff - off);","  };","};","","// Optionally export","module.exports = strtok;",""]);
/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */
// Require dependencies
_$jscmd("lib/strtok-extend.js", "line", 8);

var Buffer = require("buffer").Buffer;

_$jscmd("lib/strtok-extend.js", "line", 9);

var assert = require("assert");

_$jscmd("lib/strtok-extend.js", "line", 10);

var strtok = require("strtok");

_$jscmd("lib/strtok-extend.js", "line", 13);

// Require class for int64 storing
var Int64 = require("./int64.js");

_$jscmd("lib/strtok-extend.js", "line", 16);

// Internal function, copypasted from `strtok`
var maybeFlush = function(b, o, len, flush) {
    if (_$jscmd("lib/strtok-extend.js", "cond", "17_6_18", o + len > b.length)) {
        _$jscmd("lib/strtok-extend.js", "line", 18);
        flush(b, o);
        _$jscmd("lib/strtok-extend.js", "line", 20);
        return 0;
    }
    _$jscmd("lib/strtok-extend.js", "line", 23);
    return o;
};

_$jscmd("lib/strtok-extend.js", "line", 27);

// Extend `strtok` for reading/writing float and double numbers
strtok.FLOAT_BE = {
    len: 4,
    get: function(buf, off) {
        _$jscmd("lib/strtok-extend.js", "line", 30);
        return buf.readFloatBE(off);
    },
    put: function(b, o, v, flush) {
        _$jscmd("lib/strtok-extend.js", "line", 33);
        assert.equal(typeof o, "number");
        _$jscmd("lib/strtok-extend.js", "line", 34);
        assert.equal(typeof v, "number");
        _$jscmd("lib/strtok-extend.js", "line", 35);
        var absV = Math.abs(v);
        _$jscmd("lib/strtok-extend.js", "line", 36);
        assert.ok(_$jscmd("lib/strtok-extend.js", "cond", "36_16_15", 1.18e-38 < absV) && _$jscmd("lib/strtok-extend.js", "cond", "36_35_14", absV < 3.4e38));
        _$jscmd("lib/strtok-extend.js", "line", 37);
        assert.ok(o >= 0);
        _$jscmd("lib/strtok-extend.js", "line", 38);
        assert.ok(this.len <= b.length);
        _$jscmd("lib/strtok-extend.js", "line", 40);
        var no = maybeFlush(b, o, this.len, flush);
        _$jscmd("lib/strtok-extend.js", "line", 41);
        b.writeFloatBE(v, o);
        _$jscmd("lib/strtok-extend.js", "line", 43);
        return no - o + this.len;
    }
};

_$jscmd("lib/strtok-extend.js", "line", 46);

strtok.DOUBLE_BE = {
    len: 8,
    get: function(buf, off) {
        _$jscmd("lib/strtok-extend.js", "line", 49);
        return buf.readDoubleBE(off);
    },
    put: function(b, o, v, flush) {
        _$jscmd("lib/strtok-extend.js", "line", 52);
        assert.equal(typeof o, "number");
        _$jscmd("lib/strtok-extend.js", "line", 53);
        assert.equal(typeof v, "number");
        _$jscmd("lib/strtok-extend.js", "line", 54);
        var absV = Math.abs(v);
        _$jscmd("lib/strtok-extend.js", "line", 55);
        assert.ok(_$jscmd("lib/strtok-extend.js", "cond", "55_16_16", 2.23e-308 < absV) && _$jscmd("lib/strtok-extend.js", "cond", "55_36_15", absV < 1.79e308));
        _$jscmd("lib/strtok-extend.js", "line", 56);
        assert.ok(o >= 0);
        _$jscmd("lib/strtok-extend.js", "line", 57);
        assert.ok(this.len <= b.length);
        _$jscmd("lib/strtok-extend.js", "line", 59);
        var no = maybeFlush(b, o, this.len, flush);
        _$jscmd("lib/strtok-extend.js", "line", 60);
        b.writeDoubleBE(v, o);
        _$jscmd("lib/strtok-extend.js", "line", 62);
        return no - o + this.len;
    }
};

_$jscmd("lib/strtok-extend.js", "line", 67);

// Extend `strtok` for reading/writing int64 numbers as int32 pairs
strtok.INT64_BE = {
    len: 8,
    get: function(buf, off) {
        _$jscmd("lib/strtok-extend.js", "line", 71);
        // BE!
        return new Int64(buf.readInt32BE(off + this.len / 2), buf.readInt32BE(off));
    },
    put: function(b, o, v, flush) {
        _$jscmd("lib/strtok-extend.js", "line", 77);
        assert.equal(typeof o, "number");
        _$jscmd("lib/strtok-extend.js", "line", 78);
        assert.ok(v instanceof Int64);
        _$jscmd("lib/strtok-extend.js", "line", 79);
        v = v.toArrayPair();
        _$jscmd("lib/strtok-extend.js", "line", 80);
        assert.equal(v.length, 2);
        _$jscmd("lib/strtok-extend.js", "line", 81);
        assert.equal(typeof v[0], "number");
        _$jscmd("lib/strtok-extend.js", "line", 82);
        assert.equal(typeof v[1], "number");
        _$jscmd("lib/strtok-extend.js", "line", 83);
        assert.ok(_$jscmd("lib/strtok-extend.js", "cond", "83_16_19", v[0] >= -2147483648) && _$jscmd("lib/strtok-extend.js", "cond", "83_39_18", v[0] <= 2147483647));
        _$jscmd("lib/strtok-extend.js", "line", 84);
        assert.ok(_$jscmd("lib/strtok-extend.js", "cond", "84_16_19", v[1] >= -2147483648) && _$jscmd("lib/strtok-extend.js", "cond", "84_39_18", v[1] <= 2147483647));
        _$jscmd("lib/strtok-extend.js", "line", 85);
        assert.ok(o >= 0);
        _$jscmd("lib/strtok-extend.js", "line", 86);
        assert.ok(this.len <= b.length);
        _$jscmd("lib/strtok-extend.js", "line", 88);
        var no = maybeFlush(b, o, this.len, flush);
        _$jscmd("lib/strtok-extend.js", "line", 90);
        // BE!
        b.writeInt32BE(v[1], o);
        _$jscmd("lib/strtok-extend.js", "line", 91);
        b.writeInt32BE(v[0], o + this.len / 2);
        _$jscmd("lib/strtok-extend.js", "line", 93);
        return no - o + this.len;
    }
};

_$jscmd("lib/strtok-extend.js", "line", 98);

// Needs for UTF8 string splitting to fit buffer byte length
var maxBytesPerUtf8Symbol = 4;

_$jscmd("lib/strtok-extend.js", "line", 101);

// Constructor and get method are copypasted from node-strtok
strtok.StringType = function(l, e) {
    _$jscmd("lib/strtok-extend.js", "line", 102);
    var self = this;
    _$jscmd("lib/strtok-extend.js", "line", 104);
    self.len = l;
    _$jscmd("lib/strtok-extend.js", "line", 106);
    self.encoding = e;
    _$jscmd("lib/strtok-extend.js", "line", 108);
    self.get = function(buf, off) {
        _$jscmd("lib/strtok-extend.js", "line", 109);
        return buf.toString(this.encoding, off, off + this.len);
    };
    _$jscmd("lib/strtok-extend.js", "line", 112);
    self.put = function(buf, off, string, flush) {
        _$jscmd("lib/strtok-extend.js", "line", 113);
        assert.equal(typeof off, "number");
        _$jscmd("lib/strtok-extend.js", "line", 114);
        assert.equal(typeof string, "string");
        _$jscmd("lib/strtok-extend.js", "line", 118);
        // Removed for performance, too sanity
        //assert.equal(this.len, Buffer.byteLength(string, 'utf-8'));
        var newOff = off;
        _$jscmd("lib/strtok-extend.js", "line", 120);
        var stringPartCharLength = ~~(buf.length / maxBytesPerUtf8Symbol);
        _$jscmd("lib/strtok-extend.js", "line", 121);
        assert.ok(stringPartCharLength > 0);
        _$jscmd("lib/strtok-extend.js", "line", 122);
        var stringPart, stringPartLength;
        if (_$jscmd("lib/strtok-extend.js", "cond", "124_8_22", this.len <= buf.length)) {
            _$jscmd("lib/strtok-extend.js", "line", 125);
            newOff = maybeFlush(buf, newOff, this.len, flush);
            _$jscmd("lib/strtok-extend.js", "line", 127);
            newOff += buf.write(string, newOff, this.len, this.encoding);
        } else {
            while (string.length > 0) {
                _$jscmd("lib/strtok-extend.js", "line", 130);
                stringPart = string.substring(0, stringPartCharLength);
                _$jscmd("lib/strtok-extend.js", "line", 131);
                stringPartLength = Buffer.byteLength(stringPart, "utf-8");
                _$jscmd("lib/strtok-extend.js", "line", 133);
                newOff = maybeFlush(buf, newOff, stringPartLength, flush);
                _$jscmd("lib/strtok-extend.js", "line", 135);
                newOff += buf.write(stringPart, newOff, stringPartLength, this.encoding);
                _$jscmd("lib/strtok-extend.js", "line", 137);
                string = string.substring(stringPartCharLength);
            }
        }
        _$jscmd("lib/strtok-extend.js", "line", 141);
        return newOff - off;
    };
};

_$jscmd("lib/strtok-extend.js", "line", 146);

// Optionally export
module.exports = strtok;