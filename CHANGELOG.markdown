Changelog (revision history) for node-ubjson,
the Universal Binary JSON packer/unpacker for Node.js.

## Version 0.0.6

  * Parser should return error for malformed input
  * Error object should contain `collectedData` for malformed arrays and objects
  * Call unpackBuffer() callback only once, include remainingData
  * Now pass error to callback for unpackBuffer and packToBuffer
  * Add global and per-stream send buffer length setting with 'rw' interface
  * Write stream should split long strings
  * Implement int64/L support

## Version 0.0.5

  * Implement stream reader/writer
  * Improve readme, add API docs generated from PDoc comments
  * Split module into separate files

## Version 0.0.4

  * Support for unknown length containers unpacking

## Version 0.0.3

  * Fix object/o type marker
  * Support for byte/B, int16/i and int32/I values
  * Support for float/d and double/D values
  * Partial support for huge/h and huge/H values
  * Add MediaContent.json test from universal-binary-json-java

## Version 0.0.2

  * Support for string/s and string/S values
  * Support for object/o and object/O containers

## Version 0.0.1

  * Packer/unpacker using node-strtok
  * Support for null/Z, true/T, false/F values
  * Support for array/a and array/A containers
