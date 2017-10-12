var url = require('url');
var fs = require('fs');

function renderHTML(path, resp) {
    fs.readFile(path, null, function (err, data) {
        if (err) {
            resp.writeHead(404);
            resp.write('File not found!');
        } else {
            resp.writeHead(200, { 'Content-Type': 'text/html' });
            resp.write(data);
        }
        resp.end();
    });
}

function sortArray(numbers) {
    // check for malformed input
    var malformed = numbers.some(function (n) {
        return isNaN(n);
    });

    if (malformed) {
        res.write("Error");
    } else {
        // sort array of integers
        numbers.sort(function (a, b) {
            return a - b;
        });

        res.write(numbers.reduce(function (acc, curr) {
            return acc + curr + " ";
        }, "").trim());
    }

    // return array as space-separated string
    res.end("");
}


module.exports = {
    handleRequest: function (req, resp) {
        var path = url.parse(req.url).path;

        console.log(path);

        var components = path.split('/');
        console.log(components);
        components.shift(); // get rid of ''
        var service = components.shift();

        switch (service) {
            case 'sort':
                var numbers = components.map(function (n) {
                    return parseInt(n);
                });
                sortArray(numbers, resp);
                break;
            default:
                renderHTML('./index.html');
                break;
        }
    }
}




