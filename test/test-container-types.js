/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require('../lib/ubjson.js');

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/container-types')
              .filter(function(file) { return file.match(/\.json$/); });

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/, '/');

  var fileJSON = __dirname + '/fixtures/container-types/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  module.exports[dataType] = function (test) {
    test.expect(2);

    var jsonBuffer = fs.readFileSync(fileJSON);
    var ubjsonBuffer = fs.readFileSync(fileUBJSON);

    var jsonObject = JSON.parse(jsonBuffer.toString('utf8'));

    UBJSON.pack(jsonObject, function (buffer) {
      test.deepEqual(buffer.toString('binary'), ubjsonBuffer.toString('binary'), 'UBJSON.pack(' + dataType + ')');

      UBJSON.unpack(ubjsonBuffer, function (object) {
        test.deepEqual(object, jsonObject, 'UBJSON.unpack(' + dataType + ')');

        test.done();
      });
    });
  };
});
