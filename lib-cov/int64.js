
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
})('lib/int64.js', [57,66,75,85,89,91,94,45,47,49,38,42,58,67,76,86], {"37_6_18":0,"41_5_24":0,"67_28_9":0,"67_40_33":0,"76_29_10":0,"76_42_34":0}, ["// Licensed under the Apache License, Version 2.0 (the \"License\");","// you may not use this file except in compliance with the License.","// You may obtain a copy of the License at","//","//     http://www.apache.org/licenses/LICENSE-2.0","//","// Unless required by applicable law or agreed to in writing, software","// distributed under the License is distributed on an \"AS IS\" BASIS,","// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.","// See the License for the specific language governing permissions and","// limitations under the License.","//","// Copyright 2009 Google Inc. All Rights Reserved","","/*!"," * Defines a class for representing a 64-bit two's-complement"," * integer value, which faithfully simulates the behavior of a Java \"Long\". This"," * implementation is derived from LongLib in GWT."," *"," * Based on code from `js-bson` by Christian Amor Kvalheim:"," * https://github.com/mongodb/js-bson"," */","","/** section: Classes"," * class Int64"," *"," * Value class for storing 64-bit integers as its low and high 32-bit values."," **/","","/**"," * new Int64(low, high)"," *"," * Constructs a 64-bit two's-complement integer,"," * given its low and high 32-bit values as *signed* integers."," **/","function Int64(low, high) {","  if (high === undefined) {","    high = 0;","  }","","  if(!(this instanceof Int64)) {","    return new Int64(low, high);","  }","","  this._low = low | 0;  // force into 32 signed bits.","","  this._high = high | 0;  // force into 32 signed bits.","","  return this;","}","","/**"," * Int64#toArrayPair() -> Array"," *"," * Returns low and high part of 64-bit integer as array"," **/","Int64.prototype.toArrayPair = function () {","  return [this._low, this._high];","};","","/**"," * Int64#getLowBitsUnsigned() -> Number"," *"," * Returns *unsigned* 32-bit integer representation of low part."," **/","Int64.prototype.getLowBitsUnsigned = function() {","  return (this._low >= 0) ? this._low : Int64._TWO_PWR_32_DBL + this._low;","};","","/**"," * Int64#getHighBitsUnsigned() -> Number"," *"," * Returns *unsigned* 32-bit integer representation of high part."," **/","Int64.prototype.getHighBitsUnsigned = function() {","  return (this._high >= 0) ? this._high : Int64._TWO_PWR_32_DBL + this._high;","};","","/**"," * Int64#toNumber() -> Number"," *"," * Returns the Number value:"," * the closest floating-point representation to this 64-bit integer."," **/","Int64.prototype.toNumber = function () {","  return this._high * Int64._TWO_PWR_32_DBL + this.getLowBitsUnsigned();","};","","Int64._TWO_PWR_16_DBL = 1 << 16;","","Int64._TWO_PWR_32_DBL = Int64._TWO_PWR_16_DBL * Int64._TWO_PWR_16_DBL;","","// Export","module.exports = Int64;",""]);
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright 2009 Google Inc. All Rights Reserved
/*!
 * Defines a class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "Long". This
 * implementation is derived from LongLib in GWT.
 *
 * Based on code from `js-bson` by Christian Amor Kvalheim:
 * https://github.com/mongodb/js-bson
 */
/** section: Classes
 * class Int64
 *
 * Value class for storing 64-bit integers as its low and high 32-bit values.
 **/
/**
 * new Int64(low, high)
 *
 * Constructs a 64-bit two's-complement integer,
 * given its low and high 32-bit values as *signed* integers.
 **/
function Int64(low, high) {
    if (_$jscmd("lib/int64.js", "cond", "37_6_18", high === undefined)) {
        _$jscmd("lib/int64.js", "line", 38);
        high = 0;
    }
    if (_$jscmd("lib/int64.js", "cond", "41_5_24", !(this instanceof Int64))) {
        _$jscmd("lib/int64.js", "line", 42);
        return new Int64(low, high);
    }
    _$jscmd("lib/int64.js", "line", 45);
    this._low = low | 0;
    _$jscmd("lib/int64.js", "line", 47);
    // force into 32 signed bits.
    this._high = high | 0;
    _$jscmd("lib/int64.js", "line", 49);
    // force into 32 signed bits.
    return this;
}

_$jscmd("lib/int64.js", "line", 57);

/**
 * Int64#toArrayPair() -> Array
 *
 * Returns low and high part of 64-bit integer as array
 **/
Int64.prototype.toArrayPair = function() {
    _$jscmd("lib/int64.js", "line", 58);
    return [ this._low, this._high ];
};

_$jscmd("lib/int64.js", "line", 66);

/**
 * Int64#getLowBitsUnsigned() -> Number
 *
 * Returns *unsigned* 32-bit integer representation of low part.
 **/
Int64.prototype.getLowBitsUnsigned = function() {
    _$jscmd("lib/int64.js", "line", 67);
    return this._low >= 0 ? _$jscmd("lib/int64.js", "cond", "67_28_9", this._low) : _$jscmd("lib/int64.js", "cond", "67_40_33", Int64._TWO_PWR_32_DBL + this._low);
};

_$jscmd("lib/int64.js", "line", 75);

/**
 * Int64#getHighBitsUnsigned() -> Number
 *
 * Returns *unsigned* 32-bit integer representation of high part.
 **/
Int64.prototype.getHighBitsUnsigned = function() {
    _$jscmd("lib/int64.js", "line", 76);
    return this._high >= 0 ? _$jscmd("lib/int64.js", "cond", "76_29_10", this._high) : _$jscmd("lib/int64.js", "cond", "76_42_34", Int64._TWO_PWR_32_DBL + this._high);
};

_$jscmd("lib/int64.js", "line", 85);

/**
 * Int64#toNumber() -> Number
 *
 * Returns the Number value:
 * the closest floating-point representation to this 64-bit integer.
 **/
Int64.prototype.toNumber = function() {
    _$jscmd("lib/int64.js", "line", 86);
    return this._high * Int64._TWO_PWR_32_DBL + this.getLowBitsUnsigned();
};

_$jscmd("lib/int64.js", "line", 89);

Int64._TWO_PWR_16_DBL = 1 << 16;

_$jscmd("lib/int64.js", "line", 91);

Int64._TWO_PWR_32_DBL = Int64._TWO_PWR_16_DBL * Int64._TWO_PWR_16_DBL;

_$jscmd("lib/int64.js", "line", 94);

// Export
module.exports = Int64;