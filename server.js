const http = require('http');
const fs = require('fs');
const url = require('url');

http.createServer(function (req, res) {
    const reqUrl = url.parse(req.url, true);
    let pathname = reqUrl.pathname;
    console.log(pathname);
    if (pathname[pathname.length-1] === '/') {
        pathname = pathname.substring(0, pathname.length - 1);
    }

    if (pathname.match(/\/posts/i)) {
        fs.readFile('public/posts.json', function (err, data) {
            if (err) {
                handleError(err, res);
            } else {
                handleSuccess(res, data);
            }
        });
    }
    else if (pathname.match(/\/posts\/[0-9]+/i)) {
        const rx = /\/posts\/(.*)/i;
        const id = rx.exec(pathname)[1];
        fs.readFile('public/posts.json', function (err, data) {
            if (err) {
                handleError(err, res);
            } else {
                data = filterItems(JSON.parse(data), id);
                handleSuccess(res, data);
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Hey!');
        res.end();
    }

}).listen(8081, function () {
    console.log('Client is available at http://localhost:8081');
});


function filterItems(data, id) {
    const filteredData = data.filter((item) => {
        return item.id === Number(id);
    });
    return JSON.stringify(filteredData);
};

function handleError (err, res) {
    if (err.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Resource no found');
    }
    else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('Server Error');
    }
}

function handleSuccess (res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(data);
    res.end();
}