var url = require('url');
var fs = require('fs');
var path = require('path');
var utils = require('./utils.js');

function renderHTML(filePath, resp) {

    if (filePath == '/') {
        filePath = '/index.html';
    }

    filePath = __dirname + filePath;
    var extname = path.extname(filePath);
    var contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.readFile(filePath, null, function (err, data) {
        if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/plain' });
            resp.write('File not found!');
        } else {
            resp.writeHead(200, { 'Content-Type': contentType });
            resp.write(data);
        }

        resp.end();
    });
}

function sortArrayPlain(args, resp) {
    resp.writeHead(200, { 'Content-Type': 'text/plain' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        resp.write("Error: Invalid input");
    } else {
        args.sort((x, y) => x - y);
        resp.write(args.reduce(function (acc, curr) {
            return acc + curr + " ";
        }, "").trim());
    }

    resp.end();
}

function sortArrayBin(args, resp) {
    resp.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        resp.write("Error: Invalid input", "binary");
    } else {
        args.sort((x, y) => x - y);
        args = args.map(n => utils.intTo16BigEndianString(n));
        resp.write(args.reduce(function (acc, curr) {
            return acc + curr;
        }), "binary");
    }

    resp.end();
}

function sqrtPlain(arg, resp) {
    resp.writeHead(200, { 'Content-Type': 'text/plain' });

    arg = parseInt(arg);

    if (isNaN(arg)) {
        resp.write("Error: Invalid input", "binary");
    } else {
        var isqrt = Math.floor(Math.sqrt(arg));
        resp.write(isqrt.toString());
    }

    resp.end();
}

function sqrtBin(arg, resp) {
    resp.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    arg = parseInt(arg);

    if (isNaN(arg)) {
        resp.write("Error: Invalid input", "binary");
    } else {
        var isqrt = Math.floor(Math.sqrt(arg));
        resp.write(utils.intTo16BigEndianString(isqrt), "binary");
    }

    resp.end();
}

function minBin(args, resp) {
    resp.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        resp.write("Error: Invalid input", "binary");
    } else {
        minIndex = 0;
        for (var i = 1; i < args.length; ++i) {
            if (args[i] < args[minIndex]) minIndex = i;
        }
        resp.write(utils.intTo32BigEndianString(((minIndex & 0xFFFF) << 16) + (args[i] & 0xFFFF)), "binary");
    }
    
    resp.end();
}

function threeSumBin(args, resp) {
    resp.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        resp.write("Error: Invalid input", "binary");
    } else {
        args = args.map((n, index) => { return { val: n, index: index } });
        S = args.sort((x, y) => x.val - y.val);
        result = threeSum(S);
        if (result.length > 0) {
            resp.write(utils.intTo32BigEndianString(((result[0].a.index & 0xFFFF) << 16) + (result[0].b.index & 0xFFFF))
                + utils.intTo16BigEndianString(result[0].c.index & 0xFFFF), "binary");
        }
    }

    resp.end();
}

function threeSum(S) {
    var result = [];
    var n = S.length;
    for (var i = 0; i <= n - 3; ++i) {
        var a = S[i];
        var start = i + 1;
        var end = n - 1;
        while (start < end) {
            b = S[start];
            c = S[end];
            if (a.val + b.val + c.val == 0) {
                result.push({ a: a, b: b, c: c });
                // Continue search for all triplet combinations summing to zero
                if (b.val == S[start + 1].val) {
                    start = start + 1;
                } else {
                    end = end - 1;
                }
            } else if (a.val + b.val + c.val > 0) {
                end = end - 1;
            } else {
                start = start + 1;
            }
        }
    }

    return result;
}

module.exports = {
    handleRequest: function (req, resp) {
        var path = url.parse(req.url).path;
        var index = path.indexOf('/', 1);
        var service = path.substring(1, index);
        var args = path.substring(index + 1);

        switch (service) {
            case 'sort':
                sortArrayPlain(args, resp);
                break;
            case 'sortb':
                sortArrayBin(args, resp);
                break;
            case 'sqrt':
                sqrtPlain(args, resp);
                break;
            case 'sqrtb':
                sqrtBin(args, resp);
                break;
            case 'min':
                minBin(args, resp);
                break;
            case '3sum':
                threeSumBin(args, resp);
                break;
            default:
                renderHTML(path, resp);
                break;
        }
    }
}




