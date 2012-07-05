/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var UBJSON = require('../');

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
  var bufferWithUnsupportedType = new Buffer("X", "binary");

  UBJSON.unpackBuffer(bufferWithUnsupportedType, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedArrayWithImpossibleElement = function (test) {
  test.expect(3);

  // [a][3]
  //    [B][2]
  //    [X]
  var ubjsonBuffer = new Buffer("a\x03B\x02X", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\[2\]/));

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedNestedArraysWithImpossibleElement = function (test) {
  test.expect(4);

  // [a][2]
  //    [B][1]
  //    [a][2]
  //       [B][2]
  //       [a][2]
  //          [B][3]
  //          [X]
  var ubjsonBuffer = new Buffer("a\x02B\x01a\x02B\x02a\x02B\x03X", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\[1,\[2,\[3\]\]\]/));
    test.deepEqual(error.collectedData, [1,[2,[3]]]);

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedUnknownLengthArrayWithImpossibleElement = function (test) {
  test.expect(3);

  // [a][255]
  //    [B][2]
  //    [X]
  //    [E]
  var ubjsonBuffer = new Buffer("a\xFFB\x02XE", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\[2\]/));

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedUnknownLengthNestedArraysWithImpossibleElement = function (test) {
  test.expect(4);

  // [a][255]
  //    [B][1]
  //    [a][255]
  //       [B][2]
  //       [a][255]
  //          [B][3]
  //          [X]
  //          [E]
  //       [E]
  //    [E]
  var ubjsonBuffer = new Buffer("a\xFFB\x01a\xFFB\x02a\xFFB\x03XEEE", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\[1,\[2,\[3\]\]\]/));
    test.deepEqual(error.collectedData, [1,[2,[3]]]);

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedObjectWithArrayKey = function (test) {
  test.expect(5);

  // [o][2]
  //    [B][1][B][2]
  //
  //    [a][1]
  //       [B][3]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\x02B\x01B\x02a\x01B\x03B\x05", "binary");

  var message = 0;

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    message += 1;

    if (message === 1) {
      test.ok(error instanceof Error);
      test.ok(typeof value === 'undefined');

      test.ok(error.message.match(/\{"1":2\}/));
    } else {
      test.equal(error, null);
      test.equal(value, 5);

      test.done();
    }
  });
};

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedObjectWithObjectKey = function (test) {
  test.expect(5);

  // [o][2]
  //    [B][1][B][2]
  //
  //    [o][1]
  //       [B][3][B][6]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\x02B\x01B\x02o\x01B\x03B\x06B\x05", "binary");

  var message = 0;

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    message += 1;

    if (message === 1) {
      test.ok(error instanceof Error);
      test.ok(typeof value === 'undefined');

      test.ok(error.message.match(/\{"1":2\}/));
    } else {
      test.equal(error, null);
      test.equal(value, 5);

      test.done();
    }
  });
};

// see https://github.com/Sannis/node-ubjson/issues/22
exports.UnpackMalformedObjectWithImpossibleKey = function (test) {
  test.expect(3);

  // [o][2]
  //    [X][B][2]
  var ubjsonBuffer = new Buffer("o\x02XB\x02", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\{\}/));

    test.done();
  });
};


// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedObjectWithImpossibleValue = function (test) {
  test.expect(3);

  // [o][2]
  //    [B][2][X]
  var ubjsonBuffer = new Buffer("o\x02B\x02X", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\{\}/));

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

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedUnknownLengthObjectWithArrayKey = function (test) {
  test.expect(5);

  // [o][255]
  //    [B][1][B][2]
  //
  //    [a][1]
  //       [B][3]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\xFFB\x01B\x02a\x01B\x03B\x05", "binary");

  var message = 0;

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    message += 1;

    if (message === 1) {
      test.ok(error instanceof Error);
      test.ok(typeof value === 'undefined');

      test.ok(error.message.match(/\{"1":2\}/));
    } else {
      test.equal(error, null);
      test.equal(value, 5);

      test.done();
    }
  });
};

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedUnknownLengthObjectWithObjectKey = function (test) {
  test.expect(5);

  // [o][255]
  //    [B][1][B][2]
  //
  //    [o][1]
  //       [B][3][B][6]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\xFFB\x01B\x02o\x01B\x03B\x06B\x05", "binary");

  var message = 0;

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    message += 1;

    if (message === 1) {
      test.ok(error instanceof Error);
      test.ok(typeof value === 'undefined');

      test.ok(error.message.match(/\{"1":2\}/));
    } else {
      test.equal(error, null);
      test.equal(value, 5);

      test.done();
    }
  });
};

// see https://github.com/Sannis/node-ubjson/issues/22
exports.UnpackMalformedUnknownLengthObjectWithImpossibleKey = function (test) {
  test.expect(3);

  // [o][255]
  //    [X][B][2]
  // [E]
  var ubjsonBuffer = new Buffer("o\xFFXB\x02E", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\{\}/));

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedUnknownLengthObjectWithImpossibleValue = function (test) {
  test.expect(3);

  // [o][255]
  //    [B][2][X]
  // [E]
  var ubjsonBuffer = new Buffer("o\xFFB\x02XE", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.ok(error.message.match(/\{\}/));

    test.done();
  });
};
