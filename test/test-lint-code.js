/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var helper = require('./helper');

// Lints module code
exports.MakeLint = function (test) {
  helper.testConsoleOutput(
    './node_modules/.bin/nodelint',
    ['--config', './nodelint.cfg', './lib/', './test/'],
    {
      stdout: '0 errors\n',
      stderr: '',
      exitCode: 0
    },
    test
  );
};
