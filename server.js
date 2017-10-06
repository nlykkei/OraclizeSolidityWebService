var util = require('util');
var http = require('http');

const PORT = process.env.PORT || 8080;

http.createServer(function (req, res) {
    
    //console.log(req.url);

    var numbers = req.url.split("/");
    numbers.shift(); // remove '' 
    numbers = numbers.map(function(n) {
        return parseInt(n);
    });

    //console.log(numbers);

    numbers.sort(function(a, b) {
        return a > b;
    });

    //console.log(numbers);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(numbers.reduce(function(acc, curr) {
        return acc + curr + " "; 
    }, ""));
    res.end("");

}).listen(PORT);

//.listen(3000, "127.0.0.1");

//console.log("Server running at http://127.0.0.1:3000/");