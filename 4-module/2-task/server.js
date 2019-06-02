const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const server = new http.Server();

const handleError = (err, res) => {
  res.end('error');
};

const handleErrorLimitStream = (err, res, filepath) => {
  res.statusCode = 413;
  fs.unlink(filepath, () => {});
  res.end();
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  fs.stat(filepath, (err, stats) => {
    if (stats) {
      res.statusCode = 409;
      res.end('file is exists');
      return;
    }

    switch (req.method) {
      case 'POST':
        const stream = req
            .pipe(new LimitSizeStream({limit: 1048576}))
            .on('error', (err) => handleErrorLimitStream(err, res, filepath));

        stream
            .pipe(fs.createWriteStream(filepath))
            .on('error', (err) => handleError(err, res))
            .on('close', () => {
              res.statusCode = 201;
              res.end();
            });

        break;
      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
    req.on('close', () => {
      if (res.finished) return;
      fs.unlink(filepath, (err) => {});
    });
  });
});

module.exports = server;
