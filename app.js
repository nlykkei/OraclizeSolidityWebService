var url = require('url');
var fs = require('fs');
var utils = require('./utils.js');

function renderHTML(path, resp) {
    fs.readFile(path, null, function (err, data) {
        if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/plain' });
            resp.write('File not found!');
        } else {
            resp.writeHead(200, { 'Content-Type': 'text/html' });
            resp.write(data);
        }

        resp.end();
    });
}

function sortArray(args, resp) {
    resp.writeHead(200, { 'Content-Type': 'text/plain' });

    var numbers = args.split('/').map(n => parseInt(n));
    numbers.sort((x, y) => x - y);

    if (numbers.some(n => isNaN(n))) {
        resp.write("Error");
    } else {
        resp.write(numbers.reduce(function (acc, curr) {
            return acc + curr + " ";
        }, "").trim());
    }

    resp.end();
}

function sortArrayBin(args, resp) {
    resp.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    var numbers = args.split('/').map(n => parseInt(n));
    numbers.sort((x, y) => x - y);

    if (numbers.some(n => isNaN(n))) {
        resp.write("Error: Invalid input");
    } else {
        numbers = numbers.map(function(n) {
            return utils.intTo16BigEndianString(n);
        })
        resp.write(numbers.reduce(function (acc, curr) {
            return acc + curr;
        }));
    }

    resp.end();
}

module.exports = {
    handleRequest: function (req, resp) {
        var path = url.parse(req.url).path;
        var index = path.indexOf('/', 1);
        var service = path.substring(1, index);
        var args = path.substring(index + 1);
        switch (service) {
            case 'sort':
                sortArray(args, resp);
                break;
            case 'sortb':
                sortArrayBin(args, resp);
                break;
            default:
                renderHTML('./index.html', resp);
                break;
        }
    }
}




