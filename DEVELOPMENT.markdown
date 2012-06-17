Node-UBJSON development
=======================


Testing
-------

All functions and possible use cases should have tests, places in  `test` folder.
`node-ubjson` uses `nodeunit` as testing tool. If you contributing something,
you should check that your changes do not breaks tests.

You can test it using:

    $> make test

All branches build status: ![Build status](https://secure.travis-ci.org/Sannis/node-ubjson.png).
`Master` branch build status: ![Build status](https://secure.travis-ci.org/Sannis/node-ubjson.png?branch=master).
[Go to Travis CI site to view tests results](http://travis-ci.org/Sannis/node-ubjson).


Coding style
------------

Code style based on [Node.js code styles](http://github.com/ry/node/wiki/contributing).

1. Discuss large changes before coding (this is good idea in collaborative development)
2. Javascript code should follow [Douglas Crockford code conventions for the javascript programming language](http://javascript.crockford.com/code.html) and be run through [Nodelint](http://github.com/tav/nodelint).
   Also:
    * Code should has two space indention
    * Multi-line <code>if</code> statements must have braces
3. All code must be MIT licensed

You can lint `node-mysql-libmysqlclient` code by executing:

    $> make lint


Contributing
------------

I'll be glad to see your forks and commits in them :)

You can [email patches to me](mailto:efimovov@gmail.com)
or simply fork this repository using GitHub and send
a pull request to [me](https://github.com/Sannis).

Thanks!
