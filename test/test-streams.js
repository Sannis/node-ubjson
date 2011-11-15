/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require('../lib/ubjson.js');

// Stream to accept write() calls and track them in its own buffer rather
// than dumping them to a file descriptor
var SinkStream = function(bufferSize) {
    var self = this;

    var buffer = new Buffer(bufferSize);
    var bufferOffset = 0;

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
};

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/streams')
              .filter(function(file) { return file.match(/\.json$/); }).sort();

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/g, '/');

  var fileJSON = __dirname + '/fixtures/streams/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  var jsonBuffer = fs.readFileSync(fileJSON);
  var ubjsonBuffer = fs.readFileSync(fileUBJSON);

  var jsonArray = JSON.parse(jsonBuffer.toString('utf8'));

  var stream = new SinkStream(1024);

  module.exports[dataType] = function (test) {
    test.expect(1);

    jsonArray.forEach(function(jsonObject) {
      UBJSON.packToStreamSync(jsonObject, stream);
    });

    test.equal(
      stream.getBuffer().toString('binary'),
      ubjsonBuffer.toString('binary'),
      'UBJSON.packToStreamSync(' + dataType + ')'
    );

    test.done();
  };
});
