/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require('../lib/ubjson.js');

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/int64-numbers')
              .filter(function(file) { return file.match(/\.js$/); }).sort();

files.forEach(function(file) {
  var testName = file.replace(/\.js$/, '');

  var fileJS = __dirname + '/fixtures/int64-numbers/' + file;
  var fileUBJSON = fileJS.replace(/\.js$/, '.ubj');

  var ubjsonBuffer = fs.readFileSync(fileUBJSON);

  var jsObject = require(fileJS);

  var buffer = new Buffer(1024), resultBuffer;

  module.exports[testName] = function (test) {
    test.expect(3);

    var offset = UBJSON.packToBufferSync(jsObject, buffer);
    resultBuffer = buffer.slice(0, offset);

    test.equal(
      resultBuffer.toString('binary'),
      ubjsonBuffer.toString('binary')
    );

    UBJSON.packToBuffer(jsObject, buffer, function (offset) {
      resultBuffer = buffer.slice(0, offset);

      test.equal(
        resultBuffer.toString('binary'),
        ubjsonBuffer.toString('binary')
      );

      UBJSON.unpackBuffer(ubjsonBuffer, function (object) {
        test.deepEqual(
          object,
          jsObject
        );

        test.done();
      });
    });
  };
});
