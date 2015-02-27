var test = require('tape');
var watchify = require('../');
var browserify = require('browserify');
var vm = require('vm');

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var through = require('through2');

var os = require('os');
var tmpdir = path.join(__dirname, 'tmp', Math.random() + '');

var main = path.join(tmpdir, 'main.js');
var file = path.join(tmpdir, 'dep.jsnum');

mkdirp.sync(tmpdir);
fs.writeFileSync(main, 'require("./dep.jsnum")');
fs.writeFileSync(file, 'console.log(555)');

function someTransform(file) {
    if (!/\.jsnum$/.test(file)) {
        return through();
    }
    function write (chunk, enc, next) {
        if (/\d/.test(chunk)) {
            this.push(chunk);
        } else {
            this.emit('error', new Error('No number in this chunk'));
        }
        next();
    }
    return through(write);
}

test('errors in transform', function (t) {
    t.plan(6);
    var b = browserify(main, watchify.args);
    b.transform(someTransform);
    var w = watchify(b);
    w.bundle(function (err, src) {
        t.ifError(err);
        t.equal(run(src), '555\n');
        breakTheBuild();
    });
    function breakTheBuild() {
        setTimeout(function() {
            fs.writeFileSync(file, 'console.log()');
        }, 1000);
        w.once('update', function () {
            w.bundle(function (err, src) {
                t.ok(err instanceof Error, 'should be error');
                t.ok(/^No number in this chunk/.test(err.message));
                fixTheBuild();
            });
        });
    }
    function fixTheBuild() {
        setTimeout(function() {
            fs.writeFileSync(file, 'console.log(333)');
        }, 1000);
        var safety = setTimeout(function() {
            t.fail("gave up waiting");
            w.close();
            t.end();
        }, 5000);
        w.once('update', function () {
            clearTimeout(safety);
            w.bundle(function (err, src) {
                t.ifError(err);
                t.equal(run(src), '333\n');
                w.close();
            });
        });
    }
});

function run (src) {
    var output = '';
    function log (msg) { output += msg + '\n' }
    vm.runInNewContext(src, { console: { log: log } });
    return output;
}
