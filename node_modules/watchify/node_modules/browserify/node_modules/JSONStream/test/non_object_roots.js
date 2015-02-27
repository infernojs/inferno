var JSONStream = require('../');
var it = require('it-is');
var parser = JSONStream.parse();

var succeeded = false;

parser.on('root', function (value) {
  it(value).equal(true);
  succeeded = true;
});

parser.on('end', function() {
  it(succeeded).equal(true);
});

parser.end('true');
