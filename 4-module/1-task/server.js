const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const handleErr = (err, res) => {
  switch (err.code) {
    case 'ENOENT':
      res.statusCode = 404;
      break;
    default:
      res.statusCode = 500;
      break;
  }
  res.end();
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const arrPath = url.parse(req.url).pathname.split('/');
  if (arrPath.length > 2) {
    res.statusCode = 400;
    res.end();
    return;
  }
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      fs.createReadStream(filepath)
          .on('error', (err) => handleErr(err, res))
          .pipe(res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
