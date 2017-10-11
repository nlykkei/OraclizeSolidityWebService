var util = require('util');
var http = require('http');

// listen on port provided by Heroku in environment variable
const PORT = process.env.PORT || 8080;

http.createServer(function (req, res) {

    var resp = "";

    //console.log(req.url);

    // split URL into integer array
    var numbers = req.url.split("/");
    //console.log(numbers);
    numbers.shift(); // remove '' 
    numbers = numbers.map(function (n) {
        return parseInt(n);
    });

    console.log(numbers);

    // check for malformed input
    var malformed = numbers.some(function (n) {
        return isNaN(n);
    });

    if (malformed) {
        resp = "error";
    } else {
        // sort array of integers
        numbers.sort(function (a, b) {
            return a - b;
        });

        resp = numbers.reduce(function (acc, curr) {
            return acc + curr + " ";
        }, "").trim();
    }

    console.log(numbers);

    // return array as space-separated string
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(resp);
    res.end("");

}).listen(PORT, () => {
    console.log("Server listening on port: %s", PORT);
});

//listen(3000, "127.0.0.1");