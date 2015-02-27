var test = require('tape');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn;
var split = require('split');

var cmd = path.resolve(__dirname, '../bin/cmd.js');
var os = require('os');
var tmpdir = path.join((os.tmpdir || os.tmpDir)(), 'watchify-' + Math.random());

var files = {
    main: path.join(tmpdir, 'main.js'),
    robot: path.join(tmpdir, 'robot.js'),
    lines: path.join(tmpdir, 'lines.txt'),
    bundle: path.join(tmpdir, 'bundle.js')
};

var edits = [
    { file: 'lines', source: 'robo-boogie' },
    { file: 'lines', source: 'dinosaurus rex' },
    {
        file: 'robot',
        source: 'module.exports = function (n) { return n * 111 }',
        next: true
    },
    { file: 'main', source: [
        'var fs = require("fs");',
        'var robot = require("./robot.js");',
        'var src = fs.readFileSync(__dirname + "/lines.txt", "utf8");',
        'console.log(src.toUpperCase() + " " + robot(src.length));'
    ].join('\n') },
    { file: 'lines', source: 't-rex' },
    {
        file: 'robot',
        source: 'module.exports = function (n) { return n * 100 }',
    }
];

var expected = [
    'BEEP\nBOOP\n',
    'ROBO-BOOGIE\n',
    'DINOSAURUS REX\n',
    'DINOSAURUS REX 1554\n',
    'T-REX 555\n',
    'T-REX 500\n'
];

mkdirp.sync(tmpdir);
fs.writeFileSync(files.main, [
    'var fs = require("fs");',
    'var src = fs.readFileSync(__dirname + "/lines.txt", "utf8");',
    'console.log(src.toUpperCase());'
].join('\n'));
fs.writeFileSync(files.lines, 'beep\nboop');

test('many immediate', function (t) {
    t.plan(expected.length * 2 + edits.length);
    var ps = spawn(cmd, [
        files.main,
        '-t', require.resolve('brfs'), '-v',
        '-o', files.bundle
    ]);
    ps.stdout.pipe(process.stdout);
    ps.stderr.pipe(process.stdout);
    var lineNum = 0;
    ps.stderr.pipe(split()).on('data', function (line) {
        if (line.length === 0) return;
        
        run(files.bundle, function (err, output) {
            t.ifError(err);
            t.equal(output, expected.shift());
            
            (function next () {
                if (edits.length === 0) return;
                var edit = edits.shift();
                fs.writeFile(files[edit.file], edit.source, function (err) {
                    t.ifError(err);
                    if (edit.next) next();
                });
            })();
        })
    });
    
    t.on('end', function () {
        ps.kill();
    });
});

function run (file, cb) {
    var ps = spawn(process.execPath, [ file ]);
    var data = [];
    ps.stdout.on('data', function (buf) { data.push(buf) });
    ps.stdout.on('end', function () {
        cb(null, Buffer.concat(data).toString('utf8'));
    });
    ps.on('error', cb);
    return ps;
}
