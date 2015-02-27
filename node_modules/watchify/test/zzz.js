var test = require('tape');

test('__END__', function (t) {
    t.on('end', function () {
        setTimeout(function () {
            process.exit(0);
        }, 100)
    });
    t.end();
});
