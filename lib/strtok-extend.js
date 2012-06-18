/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

// Require dependencies
var Buffer = require('buffer').Buffer;
var assert = require('assert');
var strtok = require('strtok');

// Internal function, copypasted from `strtok`
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

// Extend `strtok` for reading/writing float and double numbers
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

// Optionally export
module.exports = strtok;
