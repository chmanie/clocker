var test = require('tape');
var spawn = require('child_process').spawn;
var path = require('path');
var del = require('del');

test('setup', function (t) {
   t.end();
});

test('starts and stop clock', function (t) {

    clocker('start', function (res, code) {
        t.equal(code, 0, 'Exit code is 0');

        clocker('stop', function (res, code) {
            t.equal(code, 0, 'Exit code is 0');
            reset(t.end.bind(t));

        });

    });

});

test('generates an entry', function (t) {

    generateEntry(0, function () {
        clocker('list', function (res) {
            t.ok(matchListLine(res), 'looks like a clocker generated line');
            reset(t.end.bind(t));
        });
    });
});

test('teardown', function (t) {
    reset(t.end.bind(t));
});

process.on('uncaughtException', function (err) {
    console.log('tearing down due to error');
    console.log(err.stack);
    reset(function () {
        process.exit(1);
    });
});

function generateEntry (duration, cb) {
    clocker('start', function () {
        setTimeout(function () {
            clocker('stop', function () {
                cb();
            });
        }, duration * 1000);
    });
}

function matchListLine (str) {
    return str.match(/^\d{10}\s{2}\d{4}\-\d{2}\-\d{2}\s{2}\[[\s\d:\-]+\]\s{2}\([\d:]+\)\n$/);
}

function reset (cb) {
    del(path.join(__dirname, 'testdata'), cb);
}

function clocker (args, cb) {
    var res = '';
    var ps = spawn(path.resolve(__dirname, '..', 'bin/cmd.js'), ['-d', path.join(__dirname, 'testdata')].concat(args));
    ps.on('close', function (code) {
        cb(res, code);
    });
    ps.stdout.on('data', function (chunk) {
        res += chunk.toString();
    });
}
