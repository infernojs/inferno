var through = require("through");
var clone   = require("lodash/lang/clone");
var babel   = require("babel-core");
var path    = require("path");

var browserify = module.exports = function (filename, opts) {
  return browserify.configure(opts)(filename);
};

browserify.configure = function (opts) {
  opts = opts || {};
  if (opts.sourceMap !== false) opts.sourceMap = "inline" ;
  if (opts.extensions) opts.extensions = babel._util.arrayify(opts.extensions);
  if (opts.ignore) opts.ignore = babel._util.regexify(opts.ignore);
  if (opts.only) opts.only = babel._util.regexify(opts.only);

  return function (filename) {
    if ((opts.ignore && opts.ignore.test(filename)) ||
        (opts.only && !opts.only.test(filename)) ||
        !babel.canCompile(filename, opts.extensions)) {
      return through();
    }

    if (opts.sourceMapRelative) {
      filename = path.relative(opts.sourceMapRelative, filename);
    }
    
    var data = "";

    var write = function (buf) {
      data += buf;
    };

    var end = function () {
      var opts2 = clone(opts);
      delete opts2.sourceMapRelative;
      delete opts2.ignore;
      delete opts2.only;
      delete opts2.extensions;
      opts2.filename = filename;

      try {
        var out = babel.transform(data, opts2).code;
      } catch(err) {
        stream.emit("error", err);
        stream.queue(null);
        return;
      }
      
      stream.queue(out);
      stream.queue(null);
    };

    var stream = through(write, end);
    return stream;
  };
};
