module.exports = {
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 1024 * 1024 * 10,
  UPLOAD_PATH: process.env.UPLOAD_PATH || '/tmp/uploads/',
  MAX_NUM_UPLOADS: process.env.MAX_NUM_UPLOADS || 20,
  MONGO_URI: process.env.MONGO_URI,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  SIGNING_KEY: process.env.SIGNING_KEY,
};
