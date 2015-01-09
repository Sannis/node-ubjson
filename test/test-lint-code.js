/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var helper = require('./helper');

// Lints module code
exports.MakeLint = function (test) {
  helper.testConsoleOutput(
    './node_modules/.bin/jshint',
    ['.', '--show-non-errors'],
    {
      stdout: '',
      stderr: '',
      exitCode: 0
    },
    test
  );
};
