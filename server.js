var util = require('util');
var http = require('http');
var app = require('./app');

// listen on port provided by Heroku in environment variable
const PORT = process.env.PORT || 8080;

http.createServer(app.handleRequest).listen(PORT, () => {
    console.log("Server listening on port: %s", PORT);
});
