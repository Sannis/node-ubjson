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
  if (high === undefined) {
    high = 0;
  }

  if(!(this instanceof Int64)) {
    return new Int64(low, high);
  }

  this._low = low | 0;  // force into 32 signed bits.

  this._high = high | 0;  // force into 32 signed bits.

  return this;
}

/**
 * Int64#toArrayPair() -> Array
 *
 * Returns low and high part of 64-bit integer as array
 **/
Int64.prototype.toArrayPair = function () {
  return [this._low, this._high];
};

/**
 * Int64#getLowBitsUnsigned() -> Number
 *
 * Returns *unsigned* 32-bit integer representation of low part.
 **/
Int64.prototype.getLowBitsUnsigned = function() {
  return (this._low >= 0) ? this._low : Int64._TWO_PWR_32_DBL + this._low;
};

/**
 * Int64#getHighBitsUnsigned() -> Number
 *
 * Returns *unsigned* 32-bit integer representation of high part.
 **/
Int64.prototype.getHighBitsUnsigned = function() {
  return (this._high >= 0) ? this._high : Int64._TWO_PWR_32_DBL + this._high;
};

/**
 * Int64#toNumber() -> Number
 *
 * Returns the Number value:
 * the closest floating-point representation to this 64-bit integer.
 **/
Int64.prototype.toNumber = function () {
  return this._high * Int64._TWO_PWR_32_DBL + this.getLowBitsUnsigned();
};

Int64._TWO_PWR_16_DBL = 1 << 16;

Int64._TWO_PWR_32_DBL = Int64._TWO_PWR_16_DBL * Int64._TWO_PWR_16_DBL;

// Export
module.exports = Int64;
