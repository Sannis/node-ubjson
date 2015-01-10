Node-UBJSON
===========

[![NPM version][NPMVI]][NPMVURL] [![BS][BSI]][BSURL] [![CS][CSI]][CSURL]

[NPMVI]: https://badge.fury.io/js/ubjson.png
[NPMVURL]: http://badge.fury.io/js/ubjson

[BSI]: https://secure.travis-ci.org/Sannis/node-ubjson.png?branch=master
[BSURL]: http://travis-ci.org/Sannis/node-ubjson

[CSI]: https://coveralls.io/repos/Sannis/node-ubjson/badge.png
[CSURL]: https://coveralls.io/r/Sannis/node-ubjson

-----

**[Universal Binary JSON] packer/unpacker for [Node.js].**

Check out the [Github repo] for the source code.
Visit [module site] for API docs and examples.
Extra information available in [wiki].

[Universal Binary JSON]: http://ubjson.org/
[Node.js]: http://nodejs.org/

[Github repo]: https://github.com/Sannis/node-ubjson
[module site]: http://sannis.github.com/node-ubjson
[wiki]: https://github.com/Sannis/node-ubjson/wiki


Installation
------------

You can install this module via [npm]:

    $> npm install ubjson

Also you can build latest source code from repository, see below.

[npm]: https://github.com/isaacs/npm


Usage example
-------------

```js
// Preallocate buffer
var buffer = new Buffer(1024);

// Synchronous pack
var offset = UBJSON.packToBufferSync(jsonObject, buffer);
buffer = buffer.slice(0, offset);

// Asynchronous pack
UBJSON.packToBuffer({"key": "value"}, buffer, function (error, offset) {
  if (error) {
    throw error;
  }

  buffer = buffer.slice(0, offset);

  // Asynchronous unpack
  UBJSON.unpackBuffer(buffer, function (error, value) {
    if (error) {
      throw error;
    }

    done();
  });
});
```

[Full API documentation](http://sannis.github.io/node-ubjson/api/).


Contributing
------------

To contribute any patches, simply fork this repository using GitHub
and send a pull request to [me](https://github.com/Sannis). Thanks!

All information about development use and contribution is placed in the [DEVELOPMENT] file.

[DEVELOPMENT]: https://github.com/Sannis/node-ubjson/blob/master/DEVELOPMENT.markdown


License
-------

MIT license. See license text in file [LICENSE](https://github.com/Sannis/node-ubjson/blob/master/LICENSE).
