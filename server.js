var util = require('util');
var http = require('http');
var querystring = require('querystring');
var app = require('./app');

// listen on port provided by Heroku in environment variable
const PORT = process.env.PORT || 8080;

var server = http.createServer(app.handleRequest).listen(PORT, () => {
    console.log("Server listening on port: %s", PORT);
});

server.on('request', function(req, res) {
    // do something here...
});

