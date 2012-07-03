/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require('../lib/ubjson.js');

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/value-types')
              .filter(function(file) { return file.match(/\.json$/); }).sort();

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/g, '/');

  var fileJSON = __dirname + '/fixtures/value-types/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  var jsonBuffer = fs.readFileSync(fileJSON);
  var ubjsonBuffer = fs.readFileSync(fileUBJSON);

  var jsonObject = JSON.parse(jsonBuffer.toString('utf8'));

  var buffer = new Buffer(1024), resultBuffer;

  module.exports[dataType] = function (test) {
    test.expect(5);

    var offset = UBJSON.packToBufferSync(jsonObject, buffer);

    resultBuffer = buffer.slice(0, offset);

    test.equal(
      resultBuffer.toString('binary'),
      ubjsonBuffer.toString('binary')
    );

    UBJSON.packToBuffer(jsonObject, buffer, function (error, offset) {
      test.equal(error, null);

      resultBuffer = buffer.slice(0, offset);

      test.equal(
        resultBuffer.toString('binary'),
        ubjsonBuffer.toString('binary')
      );

      UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
        test.equal(error, null);
        test.equal(value, jsonObject);

        test.done();
      });
    });
  };
});
