var test = require('tape');
var watchify = require('../');
var browserify = require('browserify');
var vm = require('vm');

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var split = require('split');

var os = require('os');
var tmpdir = path.join(__dirname, 'tmp', Math.random() + '');

var file = path.join(tmpdir, 'main.js');

mkdirp.sync(tmpdir);
fs.writeFileSync(file, 'console.log(555)');

test('errors', function (t) {
    t.plan(5);
    var w = watchify(browserify(file, watchify.args));
    w.bundle(function (err, src) {
        t.ifError(err);
        t.equal(run(src), '555\n');
        breakTheBuild();
    });
    function breakTheBuild() {
        setTimeout(function() {
            fs.writeFileSync(file, 'console.log(');
        }, 1000);
        w.once('update', function () {
            w.bundle(function (err, src) {
                t.ok(err instanceof Error, 'should be error');
                fixTheBuild();
            });
        });
    }
    function fixTheBuild() {
        setTimeout(function() {
            fs.writeFileSync(file, 'console.log(333)');
        }, 1000);
        w.once('update', function () {
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
