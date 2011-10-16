/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require('../lib/ubjson.js');

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/huge-numbers')
              .filter(function(file) { return file.match(/\.json$/); }).sort();

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/g, '/');

  var fileJSON = __dirname + '/fixtures/huge-numbers/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  module.exports[dataType] = function (test) {
    test.expect(1);

    var jsonBuffer = fs.readFileSync(fileJSON);
    var ubjsonBuffer = fs.readFileSync(fileUBJSON);

    var jsonObject = JSON.parse(jsonBuffer.toString('utf8'));

    UBJSON.unpack(ubjsonBuffer, function (object) {
      test.strictEqual(object, jsonObject, 'UBJSON.unpack(' + dataType + ')');

      test.done();
    });
  };
});
