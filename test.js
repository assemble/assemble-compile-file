'use strict';

require('mocha');
require('should');
var async = require('async');
var Assemble = require('assemble-core');
// var renderFile = require('assemble-render-file');
var through = require('through2');
var assert = require('assert');
var compileFile = require('./');
var path = require('path');
var app;

var cwd = path.resolve.bind(path, __dirname, 'fixtures');

function renderFile(options) {
  return function(app) {
    app.define('renderFile', function(engine, locals) {
      if (typeof engine !== 'string') {
        locals = engine;
        engine = null;
      }

      locals = locals || {};
      if (typeof engine === 'string' && engine.charAt(0) !== '.') {
        engine = '.' + engine;
      }

      return through.obj(function(file, enc, next) {
        var fn = engine ? file.engineStack[engine] : file.fn;

        app.handle('preRender', file, function(err, view) {
          if (err) return next(err);

          if (typeof fn === 'function') {
            var ctx = view.context(locals);
            view.contents = new Buffer(fn(ctx));

            for (var key in file.engineStack) {
              var engine = app.engine(key);
              var newFn = engine.compile(view.content, ctx);
              app.constructor.utils.engineStack(view, key, newFn);
            }

            app.handle('postRender', view, next);
          }
        });
      });
    });
  }
};

describe('app.compileFile()', function() {
  beforeEach(function() {
    app = new Assemble()
      .use(compileFile())
      .use(renderFile())

    app.engine('hbs', require('engine-handlebars'));
    app.engine('tmpl', require('engine-base'));
    app.engine('*', require('engine-base'));

    app.create('files', {engine: '*'});
    app.file('a', {content: 'this is <%= title() %>'});
    app.file('b', {content: 'this is <%= title() %>'});
    app.file('c', {content: 'this is <%= title() %>'});

    app.option('renameKey', function(key) {
      return path.basename(key, path.extname(key));
    });

    app.helper('title', function() {
      if (this.context.title) {
        return this.context.title;
      }
      var view = this.context.view;
      var title = view.title || view.data.title;
      if (title) {
        return title;
      }
      var key = view.key;
      var ctx = this.context[key];
      if (ctx && ctx.title) return ctx.title;
      return key;
    });
  });

  it('should compile views from src', function(cb) {
    var stream = app.src(cwd('*.hbs'));
    var files = [];

    stream.pipe(app.compileFile())
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(files[0].basename, 'a.hbs');
        assert.equal(files[1].basename, 'b.hbs');
        assert.equal(files[2].basename, 'c.hbs');
        cb();
      });
  });

  it('should compile views with the engine that matches the file extension', function(cb) {
    var stream = app.src(cwd('*.hbs'));
    var files = [];

    stream.pipe(app.compileFile())
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        cb();
      });
  });

  it.only('should compile views with multiple engines', function(cb) {
    var stream = app.src(cwd('*.hbs'));
    var files = [];

    stream
      .pipe(app.compileFile('tmpl'))
      .pipe(app.compileFile('hbs'))
      .pipe(through.obj(function(file, enc, next) {
        console.log('compiled -------')
        console.log(file.content)
        next(null, file);
      }))
      .pipe(app.renderFile('hbs'))
      .pipe(through.obj(function(file, enc, next) {
        console.log('rendered (hbs) -------')
        console.log(file.content)
        next(null, file);
      }))
      .pipe(app.renderFile('tmpl'))
      .pipe(through.obj(function(file, enc, next) {
        console.log('rendered (tmpl) -------')
        console.log(file.content)
        next(null, file);
      }))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        cb();
      });
  });

  it('should compile views from src with the engine passed on the opts', function(cb) {
    var stream = app.src(cwd('*.hbs'));
    var files = [];

    stream.pipe(app.compileFile({engine: '*'}))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        cb();
      });
  });

  it('should use the context passed on the opts', function(cb) {
    var stream = app.src(cwd('*.hbs'));
    var files = [];

    stream.pipe(app.compileFile({a: {title: 'foo'}}))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        cb();
      });
  });

  it('should support noop engines', function(cb) {
    var stream = app.src(path.join(__dirname, '.*'));
    var files = [];

    app.engine('noop', function(view, opts, next) {
      next(null, view);
    });

    stream.pipe(app.compileFile())
      .on('error', cb)
      .on('finish', cb);
  });

  it('should pass files through when `engineStrict` is false', function(cb) {
    var stream = app.src(path.join(__dirname, '.*'));

    app.option('engineStrict', false);
    stream.pipe(app.compileFile())
      .on('error', cb)
      .on('finish', cb);
  });

  it('should compile the files in a collection', function(cb) {
    var files = [];
    app.toStream('files')
      .pipe(app.compileFile())
      .on('error', cb)
      .on('data', function(file) {
        assert(file);
        assert(file.path);
        assert(file, 'function');
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        assert.equal(files.length, 3);
        cb();
      });
  });
});

describe('app.compileFile()', function() {
  beforeEach(function(cb) {
    app = new Assemble()
      .use(compileFile())

    var hbs = require('engine-handlebars');
    hbs.Handlebars.helpers = {};

    app.engine('hbs', hbs);
    app.engine('tmpl', require('engine-base'));
    app.create('partials', {viewType: 'partial'});
    app.partial('button', {content: 'Click me!'});

    app.data({title: 'foo'});
    cb();
  });

  it('should compile views with the engine specified on arguments', function(cb) {
    var stream = app.src(cwd('engines/*.hbs'));
    var files = [];

    stream.pipe(app.compileFile('tmpl'))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        cb();
      });
  });

  it('should compile with the same engine multiple times', function(cb) {
    var stream = app.src(cwd('engines/*.hbs'));
    var files = [];

    stream
      .pipe(app.compileFile('tmpl'))
      .pipe(app.compileFile('tmpl'))
      .pipe(app.compileFile('tmpl'))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        cb();
      });
  });

  it('should compile a template with multiple duplicate partials', function(cb) {
    var files = [];
    app.src(cwd('multiple/page.hbs'))
      .pipe(app.compileFile('hbs'))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        cb();
      });
  });

  it('should compile views with multiple calls to compileFile', function(cb) {
    var stream = app.src(cwd('engines/*.hbs'));
    var files = [];

    stream
      .pipe(app.compileFile('tmpl'))
      .pipe(app.compileFile('hbs'))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');

        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[1].fn, 'function');
        assert.equal(typeof files[2].fn, 'function');
        cb();
      });
  });

  it('should compile views with multiple calls to compileFile and locals', function(cb) {
    var stream = app.src(cwd('engines/a.hbs'));
    var files = [];

    stream
      .pipe(app.compileFile('tmpl', {title: 'foo'}))
      .on('error', cb)
      .pipe(app.compileFile('hbs', {title: 'bar'}))
      .on('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .on('end', function() {
        assert.equal(typeof files[0].fn, 'function');
        assert.equal(typeof files[0].fn, 'function');
        cb();
      });
  });
});

