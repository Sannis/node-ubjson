/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var helper = require('./helper');
var UBJSON = require('../');

// Create `UbjsonStream.send` and `UbjsonStream.on('value')` tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/streams')
              .filter(function(file) { return file.match(/\.json$/); }).sort();

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/g, '/');

  var fileJSON = __dirname + '/fixtures/streams/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  var jsonBuffer = fs.readFileSync(fileJSON);
  var ubjsonBuffer = fs.readFileSync(fileUBJSON);

  var jsonArray = JSON.parse(jsonBuffer.toString('utf8'));

  module.exports[dataType + "Send"] = function (test) {
    test.expect(1);

    var stream = new helper.SinkStream(1024);
    var ubjsonStream = new UBJSON.Stream(stream);

    jsonArray.forEach(function(jsonObject) {
      ubjsonStream.send(jsonObject);
    });

    test.equal(
      stream.getBuffer().toString('binary'),
      ubjsonBuffer.toString('binary'),
      'UbjsonStream#send(' + dataType + ')'
    );

    test.done();
  };

  module.exports[dataType + "Receive"] = function (test) {
    test.expect(jsonArray.length + 1);

    var stream = fs.createReadStream(fileUBJSON);
    var ubjsonStream = new UBJSON.Stream(stream);

    var valuesReceived = 0;
    ubjsonStream.on('value', function(value) {
      test.deepEqual(value, jsonArray[valuesReceived]);

      valuesReceived += 1;
    });

    stream.on("end", function () {
      test.equal(valuesReceived, jsonArray.length);

      test.done();
    });
  };
});

exports.SendBufferLength = function (test) {
  test.expect(10);

  var preserveDefaultBufferLength = UBJSON.Stream.defaultSendBufferLength;

  var defaultSendBufferLength = 10;

  test.doesNotThrow(function () {
    UBJSON.Stream.defaultSendBufferLength = defaultSendBufferLength;
  });

  test.equal(UBJSON.Stream.defaultSendBufferLength, defaultSendBufferLength);

  var statisticsStream = new helper.StatisticsStream();
  var ubjsonStream = new UBJSON.Stream(statisticsStream);

  test.equal(ubjsonStream.sendBufferLength, defaultSendBufferLength);

  test.throws(function () {
    UBJSON.Stream.defaultSendBufferLength = 2;
  }, "Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double");

  test.equal(ubjsonStream.sendBufferLength, defaultSendBufferLength);

  test.throws(function () {
    ubjsonStream.sendBufferLength = 2;
  }, "Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double");

  test.equal(ubjsonStream.sendBufferLength, defaultSendBufferLength);

  ubjsonStream.send("1234");

  test.deepEqual(
    statisticsStream.getStatistics(),
    {
      "writtenBytes": 1 + 1 + 4,
      "writtenChunks": 1
    }
  );

  statisticsStream.reset();

  ubjsonStream.send("1234567890");

  test.deepEqual(
    statisticsStream.getStatistics(),
    {
      "writtenBytes": 1 + 1 + 10,
      "writtenChunks": 2
    }
  );

  test.doesNotThrow(function () {
    UBJSON.Stream.defaultSendBufferLength = preserveDefaultBufferLength;
  });

  test.done();
};

exports.StreamLongStrings = function (test) {
  test.expect(9);

  var preserveDefaultBufferLength = UBJSON.Stream.defaultSendBufferLength;

  var defaultSendBufferLength = ~~(UBJSON.Stream.defaultSendBufferLength/3);

  UBJSON.Stream.defaultSendBufferLength = defaultSendBufferLength;
  test.equal(UBJSON.Stream.defaultSendBufferLength, defaultSendBufferLength);

  var statisticsStream = new helper.StatisticsStream();
  var ubjsonStream = new UBJSON.Stream(statisticsStream);

  test.equal(ubjsonStream.sendBufferLength, defaultSendBufferLength);

  test.throws(function () {
    UBJSON.Stream.defaultSendBufferLength = 2;
  }, "Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double");

  test.equal(ubjsonStream.sendBufferLength, defaultSendBufferLength);

  test.throws(function () {
    ubjsonStream.sendBufferLength = 2;
  }, "Send buffer should be at least 8 bytes length to store longest UBJSON type - int64/double");

  test.equal(ubjsonStream.sendBufferLength, defaultSendBufferLength);

  var longStringLength = ~~(1.5 * defaultSendBufferLength);
  var longStringHeaderLength = 1 + (longStringLength <= 255 ? 1 : 4);
  var longString = "", i;
  for (i = 0; i < longStringLength; i += 1) {
    longString += "Q";
  }

  ubjsonStream.send(longString);

  test.deepEqual(
    statisticsStream.getStatistics(),
    {
      "writtenBytes": longStringLength + longStringHeaderLength,
      "writtenChunks": 2
    }
  );

  ubjsonStream.sendBufferLength = 2 * defaultSendBufferLength;
  statisticsStream.reset();

  ubjsonStream.send(longString);

  test.deepEqual(
    statisticsStream.getStatistics(),
    {
      "writtenBytes": longStringLength + longStringHeaderLength,
      "writtenChunks": 1
    }
  );

  test.doesNotThrow(function () {
    UBJSON.Stream.defaultSendBufferLength = preserveDefaultBufferLength;
  });

  test.done();
};
