var mdeps = require('../');
var test = require('tape');
var path = require('path');

var pkg = require('./pkg/package.json');
pkg.__dirname = path.join(__dirname, '/pkg');

test('pkg', function (t) {
    t.plan(1);
    
    var d = mdeps();
    d.on('package', function (pkg_) {
        t.deepEqual(pkg_, pkg);
    });
    d.end(path.join(__dirname, '/pkg/main.js'));
    d.resume();
});
