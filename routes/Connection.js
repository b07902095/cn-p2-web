router.post('/', function(req, res) {
    var execFile = require('child_process').execFile
    // notice we're pointing this to the new executable
    var program = "../../client";

    var under = parseInt(req.body.under);
    // execFile will return immediately.
    var child = execFile(program, [],
      function (error, stdout, stderr) {
        // This function is still executed once the program terminates...
        var primes = stdout.split("\n").slice(0, -3)
                       .map(function (line) {
                           return parseInt(line);
                       });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          results: primes
        }));

        console.log("Primes generated from " + type);
    });

    // now we write "under" to stdin so the C++ program 
    // can proceed (it's blocking for user input)
    child.stdin.setEncoding('utf-8');
    child.stdin.write(under + "\n");
    // Once the stdin is written, the C++ completes and 
    // the callback above is invoked.
});