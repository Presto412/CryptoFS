const fs = require('fs');
const crypto = require('crypto');

const getFileHash = (path) => {
  return new Promise(function (resolve, reject) {
    const hash = crypto.createHash('sha1');
    const input = fs.createReadStream(path);

    input.on('error', reject);

    input.on('data', function (chunk) {
      hash.update(chunk);
    });

    input.on('close', function () {
      resolve(hash.digest('hex'));
    });
  });
};

module.exports = { getFileHash };
