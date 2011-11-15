/*
 * Code style test
 */

/**
 * Module dependencies
 */
var helper = require('./helper');

/**
 * Lint own code
 *
 * @param test
 */
exports.MakeLint = function (test) {
  helper.testConsoleOutput(
    './node_modules/.bin/nodelint',
    ['--config', './nodelint.cfg', './lib/', './test/'],
    {
      stdout: '',
      stderr: '0 errors\n',
      exitCode: 0
    },
    test
  );
};
