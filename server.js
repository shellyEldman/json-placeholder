const http = require('http');
const fs = require('fs');
const url = require('url');
const _ = require('./lodash');

const port = process.env.PORT || 8081;  // 8081 - local

http.createServer(function (req, res) {
    const reqUrl = url.parse(req.url, true);
    let pathname = reqUrl.pathname;
    if (pathname[pathname.length - 1] === '/') {
        pathname = pathname.substring(0, pathname.length - 1);
    }

    if (pathname.match(/^\/posts$/i)) {
        fs.readFile('public/posts.json', function (err, data) {
            const sortBy = reqUrl.query.sortBy;
            const userId = reqUrl.query.userId;
            if (err) {
                handleError(err, res);
            } else {
                if (sortBy) {
                    data = sortData(data, sortBy);
                }
                if (userId) {
                    data = filterItems(data, 'userId', userId)
                }
                handleSuccess(res, data);
            }
        });
    }
    else if (pathname.match(/^\/posts\/[0-9]+$/i)) {
        const rx = /\/posts\/(.*)/i;
        const id = rx.exec(pathname)[1];
        fs.readFile('public/posts.json', function (err, data) {
            if (err) {
                handleError(err, res);
            } else {
                data = filterItems(data, 'id', id);
                handleSuccess(res, data);
            }
        });
    } else if (pathname.match(/^\/comments$/i)) {
        fs.readFile('public/comments.json', function (err, data) {
            const postId = reqUrl.query.postId;
            if (err) {
                handleError(err, res);
            } else {
                if (postId) {
                    data = filterItems(data, 'postId', postId)
                }
                handleSuccess(res, data);
            }
        });

    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(__dirname + '/public/file.html').pipe(res);
    }

}).listen(port, function () {
    console.log('Client is available at http://localhost:' + port);
});


function filterItems(data, filterProperty, filteredValue) {
    data = JSON.parse(data);
    const filteredData = data.filter((item) => {
        return item[filterProperty].toString() === filteredValue;
    });
    return JSON.stringify(filteredData);
};

function handleError(err, res) {
    if (err.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Resource no found');
    }
    else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('Server Error');
    }
}

function handleSuccess(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(data);
    res.end();
}

function sortData(data, sortBy) {
    data = JSON.parse(data);
    data = _.sortBy(data, d => d[sortBy]);
    return JSON.stringify(data);
}