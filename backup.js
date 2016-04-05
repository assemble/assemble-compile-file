/*!
 * assemble-compile-file <https://github.com/jonschlinkert/assemble-compile-file>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Compile a vinyl file.
 *
 * ```js
 * app.src('*.hbs')
 *   .pipe(app.compileFile());
 * ```
 *
 * @name .compileFile
 * @param  {Object} `locals` Optionally locals to pass to the template engine for compileing.
 * @return {Object}
 * @api public
 */

module.exports = function(config) {
  return function(app) {
    config = utils.merge({}, app.options, config);

    // create a placeholder collection that can be accessed if needed,
    // with a name that is unlikely to cause collissions
    if (!app.streamFiles) {
      app.create('streamFiles');
    }

    app.define('compileFile', function(engine, locals) {
      if (typeof engine !== 'string') {
        locals = engine;
        engine = null;
      }

      var opts = {};
      if (locals && !locals.isCollection) {
        opts = utils.merge({}, config, locals);
      }

      var View = opts.View || opts.File || app.View;
      var collection = app.collection();

      return utils.through.obj(function(file, enc, next) {
        if (file.isNull()) {
          return next(null, file);
        }

        if (!file.isView) {
          // file = app.streamFiles(file.path, file);
          file = collection.view(file.path, file);
        }

        // run `onLoad` middleware
        app.handleView('onLoad', file);

        // create the context to pass to templates
        var ctx = utils.merge({}, app.cache.data, locals, file.data);

        // resolve template engine
        ctx.engine = resolveEngine(app, ctx, engine);
        // if (!ctx.engine && app.option('engineStrict') !== true) {
        // console.log(file)
        //   next(null, file);
        //   return;
        // }

        // compile the file
        app.compile(file, ctx, function(err, res) {
          if (err) {
            err.file = file;
            next(err);
            return;
          }

          var view = new View(res);
          if (engine) delete view.fn;

          next(null, res);
        });
      });
    });
  };
};

function resolveEngine(app, ctx, engine) {
  ctx.engine = engine || ctx.engine;

  // allow a `noop` engine to be defined
  if (!ctx.engine && app.engines['.noop']) {
    ctx.engine = '.noop';
  }

  return ctx.engine;
}
