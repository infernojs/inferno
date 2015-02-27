var assert = require('assert');
var path = require('path');
var resolve = require('../');

var fixtures_dir = __dirname + '/fixtures';

test('false file', function() {
    var parent_file = fixtures_dir + '/node_modules/false/index.js';
    var p = resolve.sync('./fake.js', { filename: parent_file });
    assert.equal(p, path.normalize(__dirname + '/../empty.js'));
});

test('false module', function() {
    var parent_file = fixtures_dir + '/node_modules/false/index.js';
    var p = resolve.sync('ignore-me', { filename: parent_file });
    assert.equal(p, path.normalize(__dirname + '/../empty.js'));
});
