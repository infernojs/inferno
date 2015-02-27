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
    lines: path.join(tmpdir, 'lines.txt'),
    bundle: path.join(tmpdir, 'bundle.js')
};

mkdirp.sync(tmpdir);
fs.writeFileSync(files.main, [
    'var fs = require("fs");',
    'var src = fs.readFileSync(__dirname + "/lines.txt", "utf8");',
    'console.log(src.toUpperCase());'
].join('\n'));
fs.writeFileSync(files.lines, 'beep\nboop');

test('bin brfs', function (t) {
    t.plan(4);
    var ps = spawn(cmd, [
        files.main,
        '-t', require.resolve('brfs'), '-v',
        '-o', files.bundle
    ]);
    var lineNum = 0;
    ps.stderr.pipe(split()).on('data', function (line) {
        lineNum ++;
        if (lineNum === 1) {
            run(files.bundle, function (err, output) {
                t.ifError(err);
                t.equal(output, 'BEEP\nBOOP\n');
                fs.writeFile(files.lines, 'robo-bOOgie');
            })
        }
        else if (lineNum === 2) {
            run(files.bundle, function (err, output) {
                t.ifError(err);
                t.equal(output, 'ROBO-BOOGIE\n');
                ps.kill();
            });
        }
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
