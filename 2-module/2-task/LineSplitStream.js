const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.tmpChunks = '';
  }

  _transform(chunk, encoding, callback) {
    const indxEOL = chunk.toString().indexOf(os.EOL);
    if (indxEOL === -1) {
      this.tmpChunks += chunk.toString();
    } else {
      const arrChunk = (this.tmpChunks + chunk.toString()).split(os.EOL);

      arrChunk.forEach((chunk) => {
        this.push(chunk);
      });
    }
    callback();
  }

  _flush(callback) {
    callback();
  }
}

module.exports = LineSplitStream;
