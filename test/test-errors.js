/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
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
  test.expect(3);

  // X type is not defined in UBJSON
  var bufferWithUnsupportedType = new Buffer("XXXXX", "binary");

  UBJSON.unpackBuffer(bufferWithUnsupportedType, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.equal(error.remainingData.toString("binary"), "XXXX");

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

    test.deepEqual(error.collectedData, [2]);

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedNestedArraysWithImpossibleElement = function (test) {
  test.expect(3);

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

    test.deepEqual(error.collectedData, [1, [2, [3]]]);

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

    test.deepEqual(error.collectedData, [2]);

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedUnknownLengthNestedArraysWithImpossibleElement = function (test) {
  test.expect(3);

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

    test.deepEqual(error.collectedData, [1, [2, [3]]]);

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedObjectWithArrayKey = function (test) {
  test.expect(4);

  // [o][2]
  //    [B][1][B][2]
  //
  //    [a][1]
  //       [B][3]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\x02B\x01B\x02a\x01B\x03B\x05", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.deepEqual(error.collectedData, {"1": 2});
    test.equal(error.remainingData.toString("binary"), "B\x05");

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedObjectWithObjectKey = function (test) {
  test.expect(4);

  // [o][2]
  //    [B][1][B][2]
  //
  //    [o][1]
  //       [B][3][B][6]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\x02B\x01B\x02o\x01B\x03B\x06B\x05", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.deepEqual(error.collectedData, {"1": 2});
    test.equal(error.remainingData.toString("binary"), "B\x05");

    test.done();
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

    test.deepEqual(error.collectedData, {});

    test.done();
  });
};


// see https://github.com/Sannis/node-ubjson/issues/23
exports.UnpackMalformedObjectWithImpossibleValue = function (test) {
  test.expect(3);

  // [o][2]
  //    [B][1][B][2]
  //    [B][2][X]
  var ubjsonBuffer = new Buffer("o\x02B\x01B\x02B\x02X", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.deepEqual(error.collectedData, {"1": 2, "2": undefined});

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

    test.deepEqual(error.collectedData, {"1": 2, "2": 4, "3": 6});

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

    test.deepEqual(error.collectedData, {"1": 2, "2": {"3": 6}});

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedUnknownLengthObjectWithArrayKey = function (test) {
  test.expect(4);

  // [o][255]
  //    [B][1][B][2]
  //
  //    [a][1]
  //       [B][3]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\xFFB\x01B\x02a\x01B\x03B\x05", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.deepEqual(error.collectedData, {"1": 2});
    test.equal(error.remainingData.toString("binary"), "B\x05");

    test.done();
  });
};

// see https://github.com/Sannis/node-ubjson/issues/21
exports.UnpackMalformedUnknownLengthObjectWithObjectKey = function (test) {
  test.expect(4);

  // [o][255]
  //    [B][1][B][2]
  //
  //    [o][1]
  //       [B][3][B][6]
  //       [B][5]
  var ubjsonBuffer = new Buffer("o\xFFB\x01B\x02o\x01B\x03B\x06B\x05", "binary");

  UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
    test.ok(error instanceof Error);
    test.ok(typeof value === 'undefined');

    test.deepEqual(error.collectedData, {"1": 2});
    test.equal(error.remainingData.toString("binary"), "B\x05");

    test.done();
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

    test.deepEqual(error.collectedData, {});

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

    test.deepEqual(error.collectedData, {"2": undefined});

    test.done();
  });
};

exports.ReadStreamShouldEmitErrorOnMalformedInputData = function (test) {
  test.expect(3);

  var fileJSON = __dirname + '/fixtures/errors/malformed.json';
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  var expected = JSON.parse(fs.readFileSync(fileJSON).toString('utf8'));

  var stream = fs.createReadStream(fileUBJSON);
  var ubjsonStream = new UBJSON.Stream(stream);

  // Check stream parsing before malformed data
  var values = [];

  ubjsonStream.on('value', function(value) {
    values.push(value);
  });

  ubjsonStream.on('error', function(error) {
    test.equal(error.message, expected.errorMessage);

    test.deepEqual(values, expected.values);

    // Check remaining data in stream after malformed data
    var remainingData = '';

    stream.on("data", function (data) {
      remainingData += data.toString('binary');
    });

    stream.on("end", function () {
      test.equal(remainingData, expected.remainingData);

      test.done();
    });
  });
};
