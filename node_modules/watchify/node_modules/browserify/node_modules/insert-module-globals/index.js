var parseScope = require('lexical-scope');
var through = require('through');
var merge = require('xtend');

var path = require('path');
var fs = require('fs');
var processPath = require.resolve('process/browser.js');
var combineSourceMap = require('combine-source-map');

var defaultVars = {
    process: function () {
        return 'require(' + JSON.stringify(processPath) + ')';
    },
    global: function () {
        return 'typeof global !== "undefined" ? global : '
            + 'typeof self !== "undefined" ? self : '
            + 'typeof window !== "undefined" ? window : {}'
        ;
    },
    Buffer: function () {
        return 'require("buffer").Buffer';
    },
    __filename: function (file, basedir) {
        var file = '/' + path.relative(basedir, file);
        return JSON.stringify(file);
    },
    __dirname: function (file, basedir) {
        var dir = path.dirname('/' + path.relative(basedir, file));
        return JSON.stringify(dir);
    }
};

module.exports = function (file, opts) {
    if (/\.json$/i.test(file)) return through();
    if (!opts) opts = {};
    
    var basedir = opts.basedir || '/';
    var vars = merge(defaultVars, opts.vars);
    var varNames = Object.keys(vars);
    
    var quick = RegExp(varNames.map(function (name) {
        return '\\b' + name + '\\b';
    }).join('|'));
    
    var resolved = {};
    var chunks = [];
    
    return through(write, end);
    
    function write (buf) { chunks.push(buf) }
    
    function end () {
        var self = this;
        var source = Buffer.isBuffer(chunks[0])
            ? Buffer.concat(chunks).toString('utf8')
            : chunks.join('')
        ;
        source = source.replace(/^#![^\n]*\n/, '\n');
        
        if (opts.always !== true && !quick.test(source)) {
            this.queue(source);
            this.queue(null);
            return;
        }
        
        try {
            var scope = opts.always
                ? { globals: { implicit: varNames } }
                : parseScope('(function(){\n' + source + '\n})()')
            ;
        }
        catch (err) {
            var e = new SyntaxError(
                (err.message || err) + ' while parsing ' + file
            );
            e.type = 'syntax';
            e.filename = file;
            return this.emit('error', e);
        }
        
        var globals = {};
        
        varNames.forEach(function (name) {
            if (scope.globals.implicit.indexOf(name) >= 0) {
                var value = vars[name](file, basedir);
                if (value) {
                    globals[name] = value;
                    self.emit('global', name);
                }
            }
        });
        
        this.queue(closeOver(globals, source, file, opts));
        this.queue(null);
    }
};

module.exports.vars = defaultVars;

function closeOver (globals, src, file, opts) {
    var keys = Object.keys(globals);
    if (keys.length === 0) return src;
    var values = keys.map(function (key) { return globals[key] });
    
    var wrappedSource;
    if (keys.length <= 3) {
        wrappedSource = '(function (' + keys.join(',') + '){\n'
            + src + '\n}).call(this,' + values.join(',') + ')'
        ;
    }
    else {
      // necessary to make arguments[3..6] still work for workerify etc
      // a,b,c,arguments[3..6],d,e,f...
      var extra = [ '__argument0', '__argument1', '__argument2', '__argument3' ];
      var names = keys.slice(0,3).concat(extra).concat(keys.slice(3));
      values.splice(3, 0,
          'arguments[3]','arguments[4]',
          'arguments[5]','arguments[6]'
      );
      wrappedSource = '(function (' + names.join(',') + '){\n'
        + src + '\n}).call(this,' + values.join(',') + ')';
    }

    // Generate source maps if wanted. Including the right offset for
    // the wrapped source.
    if (!opts.debug) {
        return wrappedSource;
    }
    var sourceFile = path.relative(opts.basedir, file);
    var sourceMap = combineSourceMap.create().addFile(
        { sourceFile: sourceFile, source: src},
        { line: 1 });
    return combineSourceMap.removeComments(wrappedSource) + "\n"
        + sourceMap.comment();
}
