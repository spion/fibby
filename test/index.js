var t = require('tap');

var fibby = require('../');

function errors(cb) {
    setImmediate(cb.bind(this, new Error('oops')));
}

function nowait(k, cb) {
    cb(null, k);
}

function evil(cb) {
    setTimeout(cb.bind(null, null, 'EVIL'), 10);
    setImmediate(cb.bind(null, null, 'EVIL'));
}

function normal(cb) {
    setTimeout(cb.bind(this, null, "OK"), 20);
}

function multiresult(cb) {
    setImmediate(cb.bind(this, null, 'r1', 'r2'));
}

t.test(
    "simple test", 
    fibby.fn(function (fib, t) {
        fib.yield(setImmediate(fib.resume()));
        t.ok(true, 'fib.resume success');
        t.end();    
    }));

t.test(
    "throws error", 
    fibby.fn(function (fib, t) {
        try {
            fib.yield(errors(fib.resume.t));
        } catch (e) {
            t.ok(e, "error was thrown");
            t.end();
        }
    }));

  
t.test(
    "calls callback if present instead of throwing + fibby.run", 
    function(t) { 
        fibby.run(function (fib) {
            fib.yield(errors(fib.resume.t));
        }, function(err) {
            t.ok(err, "error present");
            t.end();
        });
    });

t.test(
    "returns result into callback", 
    function(t) { 
        fibby.run(function (fib) {
            return 1;
        }, function(err, res) {
            t.equal(res, 1, "result present in callback");
            t.end();
        });
    });

t.test(
    "returns result into callback after a yield", 
    function(t) { 
        fibby.run(function (fib) {
            return fib.yield(normal(fib.resume.t));
        }, function(err, res) {
            t.equal(res, "OK", "result present in callback");
            t.end();
        });
    });



t.test(
    "handles functions that immediately call the callback in the same tick",
    fibby.fn(function (fib, t) { 
        var arr = [];
        for (var k = 0; k < 10; ++k)
            arr.push(fib.yield(nowait(k, fib.resume.t)));
        t.deepEquals(arr, [0,1,2,3,4,5,6,7,8,9], 'resumed all immediate calls');
        t.end();
    }));

t.test(
    "handles evil functions that run callbacks multiple times",
    fibby.fn(function (fib, t) {
        fib.yield(evil(fib.resume.t));
        var res = fib.yield(normal(fib.resume.t));
        t.equals(res, "OK", 'got result from non-evil function');
        t.end();
    }));

t.test(
    "fib.resume.nt yields arrays",
    fibby.fn(function (fib, t) {
        var res = fib.yield(multiresult(fib.resume.nt));
            t.equals(res[0], null, 'first argument is error');
            t.equals(res[2], 'r2', 'third argument is r2');
            t.end();
        }));

t.test(
    "listener doesnt send results to callback",
    function(t) {
        fibby.listener(function (fib, t, callback) {
            setImmediate(callback);
            return true; 
        })(t, function(err, res) {
            t.notOk(res, 'listener has no result in callback');
            t.end();
        })
    });

