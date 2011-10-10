/*!
 * Copyright by Oleg Efimov
 *
 * See license text in LICENSE file
 */

var types = {};

// General Types
types.NULL = 'Z';

// Boolean Types
types.TRUE = 'T';
types.FALSE = 'F';

// Prepare types hash to use

var typesKeys = Object.getOwnPropertyNames(types);

typesKeys.forEach(function(typeKey) {
  types[typeKey] = types[typeKey].charCodeAt(0);
});

// Public functions

function pack(javascriptData) {
  var size = 255;
  var buffer = new Buffer(size);
  var index = 0;

  if (javascriptData === null) {

    buffer[index++] = types.NULL;

  } else if (javascriptData === true) {

    buffer[index++] = types.TRUE;

  } else if (javascriptData === false) {
    
    buffer[index++] = types.FALSE;
    
  }

  var returnBuffer = new Buffer(index);
  buffer.copy(returnBuffer, 0, 0, index);
  delete buffer;


  return returnBuffer.toString('binary');
}

function unpack(javascriptData) {
  // Nothing yet here
}

// Export public functions
exports.pack = pack;
exports.unpack = unpack;
