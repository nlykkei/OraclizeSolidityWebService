var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var path = require('path');
var BigNumber = require('bignumber.js');
var utils = require('./utils.js');

const DEBUG = true;

var state = true;

/**
 * Renders HTML.
 *
 * @param {ServerRequest} req request.
 * @param {ServerResponse} res response. 
 * @returns {void} 
 */
function renderHTML(filePath, res) {

    if (filePath == '/') {
        filePath = '/index.html';
    }

    absFilePath = __dirname + filePath;
    var extname = path.extname(absFilePath);
    var contentType = 'text/html';

    if (DEBUG) console.log('[Debug]', 'renderHTML:', absFilePath);

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.readFile(absFilePath, 'utf8', function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>Oraclize Solidity</title>
                    <link rel="stylesheet" type="text/css" href="style.css">
                </head>
                <body>
                    <h1>Oraclize Solidity WebService</h1>
                    <br><br>
                    <div style="text-align:center">
                        <h2 style="font-size: 26px;">File not found.</h2>
                    </div>
                </body>
                </html>`);
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            if (filePath == '/style.css') {
                data = data.replace(/@bgcolor/g, state ? 'palegreen' : 'tomato');
            }
            else if (filePath == '/index.html') {
                data = data.replace(/@state/g, state ? 'Valid results' : 'Invalid results')
            }

            res.write(data);
        }

        res.end();
    });
}

/**
 * Sorts an array of integers.
 * The sorted array is send to the client in (16-bit) big-endian binary form.
 *
 * @param {string} args integer array ("n1/n2/...").
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function sortArray(args, res) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        res.write('Error: Invalid input', 'binary');
    }
    else {
        args.sort((x, y) => x - y);
        args = args.map(n => utils.intTo16BigEndianString(n));
        res.write(args.reduce(function (acc, curr) {
            return acc + curr;
        }), 'binary');
    }

    res.end();
}

/**
 * Computes integral square root of an integer.
 * The result is send to the client as ASCII.
 *
 * @param {string} args integer ("n").
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function sqrt(arg, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var n;

    if (state) {
        n = new BigNumber(arg);
    }
    else {
        if (DEBUG) console.log('[Debug]', 'sqrt:', 'Generating invalid result');
        n = new BigNumber(Math.floor((Math.random() * 100)));
    }

    if (n.isNaN()) {
        res.write('Error: Invalid input');
    }
    else {
        var _sqrt = n.sqrt().floor().toString(10);
        if (DEBUG) console.log('[Debug]', 'sqrt:', 'sqrt =', _sqrt);
        res.write(_sqrt);
    }

    res.end();
}

/**
 * Computes minimum over an array of integers.
 * The result is send to the client in (16-bit) big-endian binary form.
 *
 * @param {string} args integer array ("n1/n2/...").
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function minArray(args, res) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        res.write('Error: Invalid input', 'binary');
    }
    else if (args.length == 0) {
        res.write('', 'binary');
    }
    else {
        min = args[0];
        for (var i = 1; i < args.length; ++i) {
            if (args[i] < min) min = args[i];
        }
        if (DEBUG) console.log('[Debug]', 'minArray:', 'min =', min);
        res.write(utils.intTo16BigEndianString(min), 'binary');
    }

    res.end();
}

/**
 * Computes indicies of three elements in array of integers that sum to 100.
 * The result is send to the client in (16-bit) big-endian binary form.
 *
 * @param {string} args integer array ("n1/n2/...").
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function threeSum(args, res) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        res.write('Error: Invalid input', 'binary');
    }
    else {
        var sum = args.shift();
        args = args.map((n, index) => { return { val: n, index: index } });
        var S = args.sort((x, y) => x.val - y.val);

        //if (DEBUG) console.log('[Debug]', 'treeSumBin:', 'sum =', sum, 'S =', S);

        var result = [];

        if (state) {
            result = _threeSum(S, sum);
        }
        else {
            if (DEBUG) console.log('[Debug]', 'threeSum:', 'Generating invalid result');
            result.push({
                a: { val: 0, index: Math.floor(Math.random() * S.length) },
                b: { val: 0, index: Math.floor(Math.random() * S.length) },
                c: { val: 0, index: Math.floor(Math.random() * S.length) }
            });
        }

        if (DEBUG) console.log('[Debug]', 'threeSum:', 'result =', result.length > 0 ? result[0] : '');

        if (result.length > 0) {
            res.write(utils.intTo32BigEndianString(((result[0].a.index & 0xFFFF) << 16) + (result[0].b.index & 0xFFFF))
                + utils.intTo16BigEndianString(result[0].c.index & 0xFFFF), 'binary');
        }
        else {
            res.write('', 'binary');
        }
    }

    res.end();
}

/**
 * Computes indices of three elements in sorted array of integers that sum to target sum.
 *
 * @param {Array} S sorted integer array.
 * @param {int} sum target sum.
 * @returns {Object} object containing indicies.
 */
function _threeSum(S, sum) {
    var result = [];
    var n = S.length;
    for (var i = 0; i <= n - 3; ++i) {
        var a = S[i];
        var start = i + 1;
        var end = n - 1;
        while (start < end) {
            var b = S[start];
            var c = S[end];
            if (a.val + b.val + c.val == sum) {
                result.push({ a: a, b: b, c: c });
                if (b.val == S[start + 1].val) { // Search for all combinations that sum to target sum
                    start = start + 1;
                }
                else {
                    end = end - 1;
                }
            }
            else if (a.val + b.val + c.val > sum) {
                end = end - 1;
            }
            else {
                start = start + 1;
            }
        }
    }

    return result;
}

const MAX_WEIGHT = 100;

/**
 * Computes all-pairs shortest path using Floyd-Warshall algorithm.
 *
 * @param {Array} w weight matrix.
 * @returns {Object} object containing shortest path distances and path reconstruction.
 */
function floydWarshall(w) {
    var n = w.length; // Length of weight matrix
    var d = new Array(n); // All-pairs shortest distances
    var next = new Array(n); // Path reconstruction

    for (var i = 0; i < n; ++i) {
        // Initialize (n x n) array 'd' with infinity values
        d[i] = new Array(n);
        d[i].fill(Infinity);
        // Initialize (n x n) array 'next' with null values
        next[i] = new Array(n);
        next[i].fill(null);
    }

    // Set distance between vertices to edge weight (or zero)
    for (var i = 0; i < n; ++i) {
        for (var j = 0; j < n; ++j) {
            if (i == j) d[i][j] = 0;
            else d[i][j] = w[i][j];
        }
    }

    // Find all-pairs shortest path using intermediary vertices
    // sp(i,j,k) := Shortest path distance i -> j using {1,..,k} as intermediary points
    // base: sp(i,j,0) = w(i,j), sp(i,i,0) = 0
    // recursion: sp(i,j,k) = min(sp(i,j,k-1), sp(i,k,k-1) + sp(k,j,k-1)) (k >= 1)
    for (var k = 0; k < n; ++k) {
        for (var i = 0; i < n; ++i) {
            for (var j = 0; j < n; ++j) {
                if (d[i][j] > d[i][k] + d[k][j]) {
                    d[i][j] = d[i][k] + d[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }

    return { d: d, next: next };
}

/**
 * Reconstructs path between vertices.
 *
 * @param {int} u start vertex.
 * @param {int} v end vertex.
 * @param {Array} next path reconstruction.
 * @returns {Array} path between vertices.
 */
function reconstructPath(u, v, next) {
    if (next[u][v] == null) {
        return [];
    }
    path = [u];

    while (u != v) {
        u = next[u][v];
        path.push(u);
    }

    return path;
}

/**
 * Computes all-pairs shortest path in graph.
 * The result is send to the client in (16-bit) big-endian binary form.
 *
 * @param {string} args weight matrix ("n1/n2/...").
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function allPairsShortestPath(args, res) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        res.write('Error: Invalid input', 'binary');
    }
    else if (!Number.isInteger(Math.sqrt(args.length))) {
        res.write('Error: Invalid input: Not a square array', 'binary');
    }
    else {
        // Parse into (n x n) matrix 'w' (weights)
        var w = new Array(n);
        var n = Math.sqrt(args.length);

        for (var i = 0; i < n; ++i) {
            w[i] = new Array(n);
            for (var j = 0; j < n; ++j) {
                w[i][j] = (args[i * n + j] >= MAX_WEIGHT ? Infinity : args[i * n + j]);
            }
        }

        var result = floydWarshall(w);

        var d = result['d']; // All-pairs shortests path
        var next = result['next']; // Path reconstruction

        if (DEBUG) console.log('[Debug]', 'allPairsShortestPath:', 'd =', d);

        var distBin = [];

        for (var i = 0; i < n; ++i) {
            for (var j = 0; j < n; ++j) {
                distBin.push(utils.intTo16BigEndianString(d[i][j] == Infinity ? 0xFFFF : d[i][j]));
            }
        }

        //var nextBin = next.map(n => utils.intTo16BigEndianString(n));
        //res.write(nextBin.reduce((acc, curr) => acc + curr,
        //    distBin.reduce((acc, curr) => acc + curr)), 'binary');

        res.write(distBin.reduce((acc, curr) => acc + curr), 'binary');
    }

    res.end();
}

/**
 * Computes (shortest) path of certain criteria in graph.
 * The result is send to the client in (16-bit) big-endian binary form.
 *
 * @param {string} args length, max. weight, and weight matrix ("k/W/n1/n2/...").
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function kPath(args, res) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    if (args.some(arg => isNaN(arg))) {
        res.write('Error: Invalid input', 'binary');
    }

    var k = args.shift();
    var W = args.shift();

    if (k <= 0) {
        res.write('Error: Invalid input: Length must be positive', 'binary');
        res.end();
        return;
    }

    if (W < 0) {
        res.write('Error: Invalid input: Weight must be non-negative', 'binary');
        res.end();
        return;
    }

    if (!Number.isInteger(Math.sqrt(args.length))) {
        res.write('Error: Invalid input: Not a square array', 'binary');
    }
    else {
        var n = Math.sqrt(args.length);
        var w = new Array(n);
        var kp = new Array(n);

        // Parse into (n x n) weight array 'w'
        // kp[i][j][e] := Length of shortest path i -> j using 'e' edges
        for (var i = 0; i < n; ++i) {
            w[i] = new Array(n);
            kp[i] = new Array(n);
            for (var j = 0; j < n; ++j) {
                w[i][j] = (args[i * n + j] >= MAX_WEIGHT ? Infinity : args[i * n + j]);
                kp[i][j] = new Array(k + 1);
                kp[i][j].fill(Infinity); // kp[i][j][0] = Infinity (i != j)
                kp[i][j][1] = w[i][j]; // kp[i][j][1] = w[i][j]
            }
            kp[i][i][0] = 0; // kp[i][j][0] = 0 (i == j)
        }

        for (var e = 2; e <= k; ++e) {
            for (var i = 0; i < n; ++i) {
                for (var j = 0; j < n; ++j) {
                    for (var a = 0; a < n; ++a) {
                        // Shortest path i -> j using 'e' edges must be a shortest path from i -> a and a -> j
                        //if (a == i || a == j) continue; // Use intermediary edge
                        kp[i][j][e] = Math.min(kp[i][j][e], w[i][a] + kp[a][j][e - 1]);
                    }
                }
            }
        }

        // Length of shortest path i -> j using k edges
        var src = undefined;
        var dest = undefined;

        var kp_len = Infinity;

        for (var i = 0; i < n; ++i) {
            for (var j = 0; j < n; ++j) {
                if (kp_len > kp[i][j][k]) {
                    kp_len = kp[i][j][k];
                    src = i;
                    dest = j;
                }
            }
        }

        // No path of lenght 'k' with weight less than 'W'
        if (kp_len > W) {
            res.write('', 'binary');
            res.end();
            return;
        }

        // Path reconstruction
        var path = [src];
        var len = kp_len;

        if (state) {
            for (var e = k; e >= 2; --e) {
                for (var a = 0; a < n; ++a) {
                    //if (a == src || a == dest) continue; // Use intermediary edge                       
                    if (len == (w[src][a] + kp[a][dest][e - 1])) {
                        path.push(a);
                        src = a;
                        len = kp[a][dest][e - 1];
                    }
                }
            }
            path.push(dest);

            if (DEBUG) console.log('[Debug]', 'kPath:', path, kp_len);
        }
        else {
            if (DEBUG) console.log('[Debug]', 'kPath:', 'Generating invalid result');

            if (Math.floor(Math.random() * 2) == 0) {
                for (var i = 0; i < k; ++i) {
                    path.push(Math.floor(Math.random() * n));
                }
            }
            else {
                var random_len = Math.floor(Math.random() * 2 * k);
                for (var i = 0; i < random_len; ++i) {
                    path.push(Math.floor(Math.random() * n));
                }
            }

            if (DEBUG) console.log('[Debug]', 'kPath:', path);
        }

        var pathBin = path.map(n => utils.intTo16BigEndianString(n));
        res.write(pathBin.reduce((acc, curr) => acc + curr), 'binary');
    }

    res.end();
}

/**
 * Computes (smallest) dominating set of certain criteria in graph.
 * The result is send to the client in (16-bit) big-endian binary form.
 *
 * @param {string} args max. size, and adjacency matrix ("k/n1/n2/...").
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function kDomSet(args, res) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

    args = args.split('/').map(arg => parseInt(arg));

    var k = args.shift();

    if (k <= 0) {
        res.write('Error: Invalid input: Size must be positive', 'binary');
    }
    else if (args.some(arg => isNaN(arg))) {
        res.write('Error: Invalid input', 'binary');
    }
    else if (!Number.isInteger(Math.sqrt(args.length))) {
        res.write('Error: Invalid input: Not a square array', 'binary');
    }
    else {
        var n = Math.sqrt(args.length);

        if (state) {
            // Parse into (n x n) adjacency matrix 'm'
            var m = new Array(n);

            for (var i = 0; i < n; ++i) {
                m[i] = new Array(n);
                for (var j = 0; j < n; ++j) {
                    m[i][j] = args[i * n + j];
                }
            }

            if (DEBUG) console.log('[Debug]', 'kDomSet:', 'k =', k);
            if (DEBUG) console.log('[Debug]', 'kDomSet:', 'm =', m);

            var domSet = [];

            // Generate all vertex combinations
            var mask, total = Math.pow(2, n);
            for (mask = 1; mask < total; mask++) { // O(2^n)
                var dominated = new Array(n);
                dominated.fill(false);
                var set = [];

                i = n - 1; // O(n)
                do {
                    if ((mask & (1 << i)) !== 0) { // 001, 010, 011, 100, 101, 110, 111
                        set.push(i);
                    }
                } while (i--);

                if (set.length > k) {
                    // Set too large
                    continue;
                }
                else {
                    // Dominated vertices
                    for (var v = 0; v < set.length; ++v) {
                        dominated[set[v]] = true;
                        for (var u = 0; u < n; u++) {
                            if (m[set[v]][u] != 0) {
                                dominated[u] = true;
                            }
                        }
                    }
                }

                if (dominated.every(x => x == true)) { // Check dominating set 
                    if (DEBUG) console.log('[Debug]', 'kDomSet:', 'Found', set, set.length);
                    if (domSet.length == 0 || set.length < domSet.length) {
                        domSet = set;
                    }
                }
            }

            if (domSet.length > 0 && domSet.length <= k) {
                if (DEBUG) console.log('[Debug]', 'kDomSet:', 'Minimal', domSet, domSet.length);
                var domSetBin = domSet.map(n => utils.intTo16BigEndianString(n));
                res.write(domSetBin.reduce((acc, curr) => acc + curr), 'binary');
            }
            else {
                if (DEBUG) console.log('[Debug]', 'kDomSet:', 'No dominating set');
                res.write('', 'binary');
            }
        }
        else {
            if (DEBUG) console.log('[Debug]', 'kDomSet:', 'Generating invalid result');

            var domSet = []

            if (Math.floor(Math.random() * 2) == 0) {
                for (var i = 0; i < k; ++i) {
                    domSet.push(Math.floor(Math.random() * n));
                }
            }
            else {
                var random_len = Math.max(k + 1, Math.floor(Math.random() * 2 * k) + 1);
                for (var i = 0; i < random_len; ++i) {
                    domSet.push(Math.floor(Math.random() * n));
                }
            }

            //domSet = domSet.filter(function (item, pos, self) {
            //    return self.indexOf(item) == pos;
            //});

            if (DEBUG) console.log('[Debug]', 'kDomSet:', 'Minimal', domSet, domSet.length);
            var domSetBin = domSet.map(n => utils.intTo16BigEndianString(n));
            res.write(domSetBin.reduce((acc, curr) => acc + curr), 'binary');
        }
    }

    res.end();
}

/**
 * Sends echo response.
 *
 * @param {string} args value.
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function echo(args, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(args);
    res.end();
}

/**
 * Serves GET-requests.
 *
 * @param {ServerRequest} req request.
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function serveGetRequest(req, res) {
    var path = url.parse(req.url).path;
    var index = path.indexOf('/', 1);
    var service = path.substring(1, index);
    var args = path.substring(index + 1);

    switch (service) {
        case 'echo':
            echo(args, res);
            break;
        case 'sort':
            sortArray(args, res);
            break;
        case 'sqrt':
            sqrt(args, res);
            break;
        case 'min':
            minArray(args, res);
            break;
        case '3sum':
            threeSum(args, res);
            break;
        case 'apsp':
            allPairsShortestPath(args, res);
            break;
        case 'kp':
            kPath(args, res);
            break;
        case 'kds':
            kDomSet(args, res);
            break;
        default:
            renderHTML(path, res);
            break;
    }
}

/**
 * Serves POST-requests.
 *
 * @param {ServerRequest} req request.
 * @param {ServerResponse} res response.
 * @returns {void} 
 */
function servePostRequest(req, res) {
    var path = url.parse(req.url).path;
    var index = path.indexOf('/', 1);
    var service = path.substring(1, index);
    var args = path.substring(index + 1);

    res.writeHead(200, { 'Content-Type': 'text/plain' });

    //var buffer = Buffer.alloc(0);
    var data = '';

    req.on('data', function (chunk) {
        //buffer = Buffer.concat([buffer, Buffer.from(chunk, 'binary')]);
        data += chunk.toString('utf8');
    });

    req.on('end', function () {
        //if (DEBUG) console.log('[Debug]', 'servePostRequest:', buffer.toString('hex'));

        var query = querystring.parse(data);

        if (DEBUG) console.log('[Debug]', 'servePostRequest:', data, query);

        if (query.state == 'flip') {
            state = !state;
            renderHTML('/', res); // index.html
        }
        else {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <title>Oraclize Solidity</title>
                <link rel="stylesheet" type="text/css" href="style.css">
            </head>
            <body>
                <h1>Oraclize Solidity WebService</h1>
                <br><br>
                <div style="text-align:center">
                    <h2 style="font-size: 26px;">Request not supported.</h2>
                </div>
            </body>
            </html>`);
            res.end();
        }
    });
}

module.exports = {
    handleRequest: function (req, res) {
        if (DEBUG) console.log('[Debug]', 'handleRequest:', req.method);
        if (DEBUG) console.log('[Debug]', 'handleRequest:', req.headers);
        if (DEBUG) console.log('[Debug]', 'handleRequest:', req.url);

        if (req.method == 'POST') {
            servePostRequest(req, res);
        }
        else if (req.method == 'GET') {
            serveGetRequest(req, res);
        }
    }
}




