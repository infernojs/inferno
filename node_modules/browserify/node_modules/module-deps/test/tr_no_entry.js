var mdeps = require('../');
var test = require('tape');
var JSONStream = require('JSONStream');
var packer = require('browser-pack');
var through = require('through');
var concat = require('concat-stream');
var path = require('path');

test('transform no entry', function (t) {
    t.plan(1);
    var p = mdeps({
        transform: [ function (file) {
            return through(function (buf) {
                this.queue(String(buf).replace(/AAA/g, '"WOW"'));
            });
        } ]
    });
    p.end({
        file: path.join(__dirname, '/files/tr_no_entry/main.js'),
        id: 'xxx'
    });
    
    p.pipe(JSONStream.stringify()).pipe(packer())
        .pipe(concat(function (body) {
            var con = { log: function (x) { t.equal(x, 'WOW') } };
            var src = 'require=' + body.toString('utf8') + ';require("xxx")';
            Function('console', src)(con);
        }))
    ;
});
