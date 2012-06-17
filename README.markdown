Node-UBJSON [![Build status][Build status image]][Build status URL]
===================================================================

**[Universal Binary JSON] packer/unpacker for [Node.js].**

**This module has been tested with Node.js versions 0.6.18 and 0.7.11**

Check out the [Github repo] for the source code.
Visit [module site] for API docs and examples.
Extra information available in [wiki].

[Universal Binary JSON]: http://ubjson.org/
[Node.js]: http://nodejs.org/
[Build status image]: https://secure.travis-ci.org/Sannis/node-ubjson.png?branch=master
[Build status URL]: http://travis-ci.org/Sannis/node-ubjson

[Github repo]: https://github.com/Sannis/node-ubjson
[module site]: http://sannis.github.com/node-ubjson
[wiki]: https://github.com/Sannis/node-ubjson/wiki


Dependencies
------------

This module depends on [node-strtok] library for tokenize UBJSON data.

[node-strtok]: https://github.com/pgriess/node-strtok


Installation
------------

You can install this module via [npm]:

    $> npm install ubjson

Also you can build latest source code from repository, see below.

[npm]: https://github.com/isaacs/npm


Work with development version
-----------------------------

To get source code:

    $> git clone git://github.com/Sannis/node-ubjson.git
    $> cd node-ubjson

To get dependencies simply run make:

    $> make

To run tests:

    $> make test

Current test status: [![Build Status](https://secure.travis-ci.org/Sannis/node-ubjson.png)](http://travis-ci.org/Sannis/node-ubjson)

To lint code:

    $> make lint

To generate documentation:

    $> make doc

[Nodeunit], [nodelint] and [ndoc] have been used for developers purposes.
Them will be automatically installed when oyu use make for _test_, _lint_ or _docs_.

[Nodeunit]: https://github.com/caolan/nodeunit
[nodelint]: https://github.com/tav/nodelint
[ndoc]: https://github.com/nodeca/ndoc


Contributing
------------

To contribute any patches, simply fork this repository using GitHub
and send a pull request to [me](https://github.com/Sannis). Thanks!

All information about development use and contribution is placed in the [DEVELOPMENT] file.

[DEVELOPMENT]: https://github.com/Sannis/node-ubjson/blob/master/DEVELOPMENT.markdown


Contributors
------------

* **Oleg Efimov** ( [E-mail](mailto:efimovov@gmail.com), [GitHub](https://github.com/Sannis), [site](http://sannis.ru) \)

  Maintainer.  
  [All commits](https://github.com/Sannis/node-ubjson/commits/master?author=Sannis).


[Full contributors list](https://github.com/Sannis/node-ubjson/contributors).


License
-------

MIT license. See license text in file [LICENSE](https://github.com/Sannis/node-ubjson/blob/master/LICENSE).
