var browserify = require('../');
var vm = require('vm');
var test = require('tap').test;
var fs = require('fs');

var testFiles = [
    __dirname + '/multi_entry/a.js',
    __dirname + '/multi_entry/b.js',
    __dirname + '/multi_entry/c.js'
];

test('multi entry', function (t) {
    t.plan(3);
    
    var b = browserify([
        testFiles[0],
        testFiles[1]
    ]);
    b.add(testFiles[2]);

    b.bundle(function (err, src) {
        var c = {
            times : 0,
            t : t
        };
        vm.runInNewContext(src, c);
    });
});

test('entries as streams', function (t) {
    t.plan(3);
    
    // transform paths to streams
    for (var i = 0; i < testFiles.length; i++) {
        testFiles[i] = fs.createReadStream(testFiles[i]);
    }
    
    // commondir blows up with streams and without basedir
    var opts = { basedir: __dirname + '/multi_entry' };
    
    var b = browserify([
        testFiles[0],
        testFiles[1]
    ], opts);
    b.add(testFiles[2]);
    
    b.bundle(function (err, src) {
        var c = {
            times : 0,
            t : t
        };
        vm.runInNewContext(src, c);
    });
});
