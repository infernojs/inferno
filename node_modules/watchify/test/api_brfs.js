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

var files = {
    main: path.join(tmpdir, 'main.js'),
    lines: path.join(tmpdir, 'lines.txt')
};

mkdirp.sync(tmpdir);
fs.writeFileSync(files.main, [
    'var fs = require("fs");',
    'var src = fs.readFileSync(__dirname + "/lines.txt", "utf8");',
    'console.log(src.toUpperCase());'
].join('\n'));
fs.writeFileSync(files.lines, 'beep\nboop');

test('api with brfs', function (t) {
    t.plan(5);
    var w = watchify(browserify(files.main, watchify.args));
    w.transform('brfs');
    w.on('update', function () {
        w.bundle(function (err, src) {
            t.ifError(err);
            t.equal(run(src), 'ROBO-BOOGIE\n');
            w.close();
        });
    });
    w.bundle(function (err, src) {
        t.ifError(err);
        t.equal(run(src), 'BEEP\nBOOP\n');
        setTimeout(function () {
            fs.writeFile(files.lines, 'rObO-bOOgie', function (err) {
                t.ifError(err);
            });
        }, 1000);
    });
});

function run (src) {
    var output = '';
    function log (msg) { output += msg + '\n' }
    vm.runInNewContext(src, { console: { log: log } });
    return output;
}
