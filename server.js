var util = require('util');
var http = require('http');

// listen on port provided by Heroku in environment variable
const PORT = process.env.PORT || 8080;

http.createServer(function (req, res) {

    //console.log(req.url);

    // split URL into integer array
    var numbers = req.url.split("/");
    numbers.shift(); // remove '' 
    numbers = numbers.map(function (n) {
        return parseInt(n);
    });

    // sort array of integers
    numbers.sort(function (a, b) {
        return a > b;
    });

    console.log(numbers);

    // return array as space-separated string
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(numbers.reduce(function (acc, curr) {
        return acc + curr + " ";
    }, ""));
    res.end("");

}).listen(PORT, () => {
    console.log("Server listening on port: %s", PORT);
});

//listen(3000, "127.0.0.1");