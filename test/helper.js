/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */
var childProcess = require('child_process');

var node_deprecated_warning = "The \"sys\" module is now called \"util\". " +
                              "It should have a similar interface.\n";

// Helper for testing external program output
function testConsoleOutput(file, args, expected, test) {
  childProcess.execFile(file, args, function (error, stdout, stderr) {
    var testsCount = 0;
    if (expected.hasOwnProperty('exitCode')) {
      testsCount += 1; // error.code || !error
    }
    if (expected.hasOwnProperty('exitSignal')) {
      testsCount += 1; // error
      testsCount += 1; // error.signal
    }
    if (expected.hasOwnProperty('stdout')) {
      testsCount += 1; // stdout
    }
    if (expected.hasOwnProperty('stderr')) {
      testsCount += 1; // stderr
    }

    test.expect(testsCount);

    if (expected.hasOwnProperty('exitCode')) {
      if (expected.exitCode === 0) {
        test.equals(error, null);
      } else {
        test.equals(error.code, expected.exitCode);
      }
    }
    if (expected.hasOwnProperty('exitSignal')) {
      test.ok(error instanceof Error);
      test.equals(error.signal, expected.exitSignal);
    }
    if (expected.hasOwnProperty('stdout')) {
      test.equals(stdout.replace(node_deprecated_warning, ''), expected.stdout);
    }
    if (expected.hasOwnProperty('stderr')) {
      test.equals(stderr.replace(node_deprecated_warning, ''), expected.stderr);
    }

    test.done();
  });
}

exports.testConsoleOutput = testConsoleOutput;

// Stream to accept write() calls and track them into its own buffer
// rather than dumping them to a file descriptor
var SinkStream = function(bufferSize) {
    var self = this;

    var buffer = new Buffer(bufferSize);
    var bufferOffset = 0;

    // This is writable stream
    self.writable = true;

    self.write = function(data, length) {
        var bl = (typeof data === 'string') ?
            Buffer.byteLength(data, length) :
            data.length;

        if (bufferOffset + bl >= buffer.length) {
            var b = new Buffer(((bufferOffset + bl + bufferSize - 1) / bufferSize) * bufferSize);
            buffer.copy(b, 0, 0, bufferOffset);
            buffer = b;
        }

        if (typeof data === 'string') {
            buffer.write(data, bufferOffset, length);
        } else {
            data.copy(buffer, bufferOffset, 0, data.length);
        }

        bufferOffset += bl;
    };

    self.getBuffer = function() {
        var b = new Buffer(bufferOffset);
        buffer.copy(b, 0, 0, bufferOffset);

        return b;
    };

    self.reset = function() {
        bufferOffset = 0;
    };

    // This is not readable stream
    self.readable = false;
};

exports.SinkStream = SinkStream;

// Stream to accept write() calls and collect some statistics
function StatisticsStream() {
  var self = this;

  var writtenBytes = 0;
  var writtenChunks = 0;

  // This is writable stream
  this.writable = true;

  // Write method
  // Supports both [buffer] or [string, encoding] as arguments
  self.write = function (data, encoding) {
    if (!Buffer.isBuffer(data)) {
      if (typeof(encoding) !== 'string') {
        encoding = 'utf8';
      }
      data = new Buffer(data.toString(), encoding);
    }

    writtenBytes += data.length;
    writtenChunks += 1;
  };

  self.getStatistics = function() {
    return {
      "writtenBytes": writtenBytes,
      "writtenChunks": writtenChunks
    };
  };

  self.reset = function() {
    writtenBytes = 0;
    writtenChunks = 0;
  };

  // This is not readable stream
  self.readable = false;
}

exports.StatisticsStream = StatisticsStream;
