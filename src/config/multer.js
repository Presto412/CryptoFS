const envConfig = require('./env');

module.exports = {
  dest: envConfig.UPLOAD_PATH,
  limits: { fileSize: envConfig.MAX_FILE_SIZE },
};
