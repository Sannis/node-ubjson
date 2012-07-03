/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var UBJSON = require('../lib/ubjson.js');

exports.PackUnsupportedTypes = function (test) {
  test.expect(3);

  var unsupportedTypeValue = new Date();
  var valueContainsUnsupportedTypeValues = {
    a: 1,
    b: 2,
    c: [
      "qwerty",
      unsupportedTypeValue,
      12e34
    ]
  };

  var buffer = new Buffer(1024);

  test.throws(function () {
    return UBJSON.packToBufferSync(valueContainsUnsupportedTypeValues, buffer);
  });

  UBJSON.packToBuffer(valueContainsUnsupportedTypeValues, buffer, function (error, offset) {
    test.ok(error instanceof Error);
    test.ok(typeof offset === 'undefined');

    test.done();
  });
};

exports.UnpackUnsupportedTypes = function (test) {
  test.expect(2);

  // X type is not defined in UBJSON
  //var bufferWithUnsupportedType = new Buffer("a\x03TXT", "binary");
  var bufferWithUnsupportedType = new Buffer("X", "binary");

  UBJSON.unpackBuffer(bufferWithUnsupportedType, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/14
exports.UnpackMalformedUnknownLengthObject = function (test) {
  test.expect(3);

  // [o][255]
  //    [B][1][B][2]
  //    [B][2][B][4]
  //    [B][3][B][6]
  //    [B][4][E]
  var ubjsonBuffer = new Buffer("o\xFFB\x01B\x02B\x02B\x04B\x03B\x06B\x04E", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\{"1":2,"2":4,"3":6\}/));

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/14
exports.UnpackMalformedUnknownLengthObjectDeeper = function (test) {
  test.expect(3);

  // [o][255]
  //    [B][1][B][2]
  //    [B][2][o][255]
  //             [B][3][B][6]
  //             [B][4][E]
  var ubjsonBuffer = new Buffer("o\xFFB\x01B\x02B\x02o\xFFB\x03B\x06B\x02E", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\{"1":2\}/));

    test.done();
  });
};
