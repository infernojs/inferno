var assert = require('assert');
var resolve = require('../');

var fixtures_dir = __dirname + '/fixtures';

test('local', function() {
    // resolve needs a parent filename or paths to be able to lookup files
    // we provide a phony parent file
    var path = resolve.sync('./foo', { filename: fixtures_dir + '/phony.js' });
    assert.equal(path, require.resolve('./fixtures/foo'));
});

