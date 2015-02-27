var browserify = require('../');
var vm = require('vm');
var test = require('tap').test;
var fs = require('fs');
var through = require('through2');

test('stream file', function (t) {
    var expected = {};
    expected[__dirname + '/stream/fake.js'] = true;
    expected[__dirname + '/stream/bar.js'] = true;
    expected[__dirname + '/stream/foo.js'] = true;
    
    t.plan(5);
    
    var stream = fs.createReadStream(__dirname + '/stream/main.js');
    stream.file = __dirname + '/stream/fake.js';
    
    var b = browserify(stream, { basedir: __dirname + '/stream' });
    b.transform(function (file) {
        t.ok(expected[file]);
        delete expected[file];
        return through();
    });
    
    b.bundle(function (err, src) {
        vm.runInNewContext(src, { t: t });
    });
});
