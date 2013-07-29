# fibby

A tiny ES6 (harmony) library for node 0.11.2 and up that helps you 
use fibers with node style callbacks, similar to 
[suspend](https://github.com/jmar777/suspend)

# usage examples

Spawn a fiber task. From within your task, call your async 
functions with yield and pass them a resume function instead of
a callback:

```js
fibby.run(function* (fib) {
    console.log("Hello");
    fib.yield(setInterval(fib.resume(), 1000))
    console.log("World");
});
```

Handle errors with `try`/`catch`, or as return results via
`resume.nothrow`

```js
fibby.run(function* (fib) {
    // Throwing resume
    try { fib.yield(fs.readFile("test.js", fib.resume())); } 
    catch (e) { /* handle the error */ }
    // Non-throwing resume always results with an array
    var err_res = fib.yield(fs.readFile("test.js", fib.resume.nothrow()));
    if (err_res[0]) { /* handle error */ }
});

```
Dont like nested parens? Want to keep things brief? Use `resume.t` 
instead of `resume()` and `resume.nt` instead of `resume.nothrow()`

Want to catch all uncaught exceptions? You can pass a callback argument to
`fibby.run`:

```js
fibby.run(function* (fib) {
    var data = fib.yield(fs.readFile("test.js", fib.resume.t));
}, function(err) {
    // thrown error propagates here automagically 
    // because it was not caught.
});
```

You can also use `fibby` instead to create a function which
can accept multiple arguments and a callback. The arguments will be 
passed to your fiber right after the first `resume` argument

```js
var getLine = fibby.fn(function* (fib, file, number) {
    var data = fib.yield(fs.readFile(file, fib.resume.t));
    return data.toString().split('\n')[number];
});

getLine('test.js', 2, function(err, lineContent) {
    // thrown error propagates here automagically 
    // because it was not caught.
    // If the file actually exists, lineContent
    // will contain the second line
});
```

note: make sure that you pass the callback last. 

Notice how if you return a value at the end of your fiber, it will
be passed as a result to the callback. If you return undefined, the
callback will not be called.


Your async functions call the callback with more than 2 arguments?
Not a problem - the yield call from within your task will return 
an array instead.

```js
function returnsmore(callback) {
    callback(null, 'arg1', 'arg2');
}

fibby.run(function* (fib) {
    var res = fib.yield(returnsmore(fib.resume.t));
    var arg1 = res[0];
    var arg2 = res[1];
    var nothrowres = fib.yield(returnsmore(fib.resume.nt);
    var err = res[0];
    var arg1 = res[1];
    var arg2 = res[2];
});
```

Look in `test/index.js` for more examples and tests.

# thanks

[jmar777](https://github.com/jmar777) for his awesome 
[suspend](https://github.com/jmar777/suspend) library which served 
as the base for fibby

# license 

MIT

