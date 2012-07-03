/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var Stream = require('stream').Stream;
var UBJSON = require('../');

// Stream to accept write() calls and track them in its own buffer rather
// than dumping them to a file descriptor
var SinkStream = function(bufferSize) {
    var self = this;

    var buffer = new Buffer(bufferSize);
    var bufferOffset = 0;

    // This is writable stream
    self.writable = true;

    self.write = function(data, length) {
        var bl = (typeof data === 'string') ?
            Buffer.byteLength(data, length) :
            data.length;

        if (bufferOffset + bl >= buffer.length) {
            var b = new Buffer(((bufferOffset + bl + bufferSize - 1) / bufferSize) * bufferSize);
            buffer.copy(b, 0, 0, bufferOffset);
            buffer = b;
        }

        if (typeof data === 'string') {
            buffer.write(data, bufferOffset, length);
        } else {
            data.copy(buffer, bufferOffset, 0, data.length);
        }

        bufferOffset += bl;
    };

    self.getBuffer = function() {
        var b = new Buffer(bufferOffset);
        buffer.copy(b, 0, 0, bufferOffset);

        return b;
    };

    self.reset = function() {
        bufferOffset = 0;
    };

    // This is not readable stream
    self.readable = false;
};

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

    var stream = new SinkStream(1024);
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
    ubjsonStream.addListener('value', function(value) {
      test.deepEqual(value, jsonArray[valuesReceived]);

      valuesReceived += 1;
    });

    stream.on("end", function () {
      test.equal(valuesReceived, jsonArray.length);

      test.done();
    });
  };
});
