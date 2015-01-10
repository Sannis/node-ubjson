/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require(process.env.LIB_COV ? '../lib-cov/ubjson' : '../');

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/huge-numbers-pack')
              .filter(function(file) { return file.match(/\.json$/); }).sort();

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/g, '/');

  var fileJSON = __dirname + '/fixtures/huge-numbers-pack/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  var jsonBuffer = fs.readFileSync(fileJSON);
  var ubjsonBuffer = fs.readFileSync(fileUBJSON);

  var jsonObject = JSON.parse(jsonBuffer.toString('utf8'));

  var buffer = new Buffer(1024), resultBuffer;

  module.exports[dataType] = function (test) {
    test.expect(3);

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

      test.done();
    });
  };
});
