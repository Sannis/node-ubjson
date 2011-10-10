/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var fs = require('fs');
var UBJSON = require('../lib/ubjson.js');

// Create tests for all fixtures files
var files = fs.readdirSync(__dirname + '/fixtures/simple-types')
              .filter(function(file) { return file.match(/\.json$/); });

files.forEach(function(file) {
  var dataType = file.replace(/\.json$/, '').replace(/_/, '/');

  var fileJSON = __dirname + '/fixtures/simple-types/' + file;
  var fileUBJSON = fileJSON.replace(/\.json$/, '.ubj');

  module.exports[dataType] = function (test) {
    test.expect(1);

    var json = fs.readFileSync(fileJSON);
    var ubjson = fs.readFileSync(fileUBJSON, 'binary');

    var object = JSON.parse(json);

    test.deepEqual(UBJSON.pack(object), ubjson, 'UBJSON.pack(' + dataType + ')');
    //test.deepEqual(UBJSON.unpack(ubjson), object, 'UBJSON.unpack(' + dataType + ')');

    test.done();
  };
});
