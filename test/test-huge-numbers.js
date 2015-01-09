/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require(process.env.LIB_COV ? '../lib-cov/ubjson' : '../');

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/huge-numbers')
              .filter(function(file) { return file.match(/\.json$/); }).sort();

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/g, '/');

  var fileJSON = __dirname + '/fixtures/huge-numbers/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  var jsonBuffer = fs.readFileSync(fileJSON);
  var ubjsonBuffer = fs.readFileSync(fileUBJSON);

  var jsonObject = JSON.parse(jsonBuffer.toString('utf8'));

  module.exports[dataType] = function (test) {
    test.expect(2);

    UBJSON.unpackBuffer(ubjsonBuffer, function (error, value) {
      test.equal(error, null);
      test.deepEqual(value, jsonObject);

      test.done();
    });
  };
});
