const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const envConfig = require('../config/env');

const fileSchema = mongoose.Schema(
  {
    fileContentHash: String,
    paths: [String],
  },
  {
    timestamps: true,
  }
);

fileSchema.plugin(encrypt, {
  encryptionKey: envConfig.ENCRYPTION_KEY,
  signingKey: envConfig.SIGNING_KEY,
  excludeFromEncryption: ['fileContentHash'],
});

module.exports = mongoose.model('File', fileSchema);
