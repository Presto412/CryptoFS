const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const envConfig = require('../config/env');

const userSchema = mongoose.Schema(
  {
    publicKey: String,
    filesUploaded: [
      {
        fileContentHash: String,
        metaData: {
          filename: String,
          dateUploaded: String,
          size: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(encrypt, {
  encryptionKey: envConfig.ENCRYPTION_KEY,
  signingKey: envConfig.SIGNING_KEY,
  excludeFromEncryption: ['publicKey'],
});

module.exports = mongoose.model('User', userSchema);
