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
