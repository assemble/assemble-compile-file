# assemble-compile-file [![NPM version](https://img.shields.io/npm/v/assemble-compile-file.svg?style=flat)](https://www.npmjs.com/package/assemble-compile-file) [![NPM downloads](https://img.shields.io/npm/dm/assemble-compile-file.svg?style=flat)](https://npmjs.org/package/assemble-compile-file) [![Build Status](https://img.shields.io/travis/jonschlinkert/assemble-compile-file.svg?style=flat)](https://travis-ci.org/jonschlinkert/assemble-compile-file)

> Assemble plugin for compiling views (in a vinyl pipeline) that might need to be rendered more than once.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install assemble-compile-file --save
```

## Usage

**WIP! This is not 100% ready for production use!**

Please feel free to play around with it if you want. Feedback or bug reports welcome.

```js
var compileFile = require('assemble-compile-file');
var assemble = require('assemble');

// register as an instance plugin with assemble
var app = assemble()
  .use(compileFile());

// then use in a vinyl pipeline
app.src('*.hbs')
  .pipe(app.compilefile())
  .pipe(app.dest('foo'));
```

### noop engine

By default, when no engine is found for a file an error is thrown. To get around this you can either define a `noop` engine, or use disable the [engineStrict option](#optionsengineStrict).

A noop engine follows the same signature as any engine, but must be registered using the key: `noop`.

**Example**

```js
app.engine('noop', function(view, opts, next) {
  // do whatever you want to `view`, or nothing
  next(null, view);
});
```

## Options

### options.engineStrict

By default, when no engine is found for a file an error is thrown. This can be disabled with the following:

```js
app.option('engineStrict', false);
```

When disabled and an engine is not found, files are just passed through.

## Related projects

You might also be interested in these projects:

* [assemble](https://www.npmjs.com/package/assemble): Assemble is a powerful, extendable and easy to use static site generator for node.js. Used… [more](https://www.npmjs.com/package/assemble) | [homepage](https://github.com/assemble/assemble)
* [assemble-loader](https://www.npmjs.com/package/assemble-loader): Assemble plugin (^0.6.0) for loading globs of views onto custom view collections. Also works with… [more](https://www.npmjs.com/package/assemble-loader) | [homepage](https://github.com/jonschlinkert/assemble-loader)
* [assemble-streams](https://www.npmjs.com/package/assemble-streams): Assemble pipeline plugin for pushing a view collection into a vinyl stream. | [homepage](https://github.com/assemble/assemble-streams)
* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://www.npmjs.com/package/base) | [homepage](https://github.com/node-base/base)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/assemble-compile-file/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/jonschlinkert/assemble-compile-file/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v, on April 05, 2016._