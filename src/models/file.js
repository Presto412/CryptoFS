const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

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
  encryptionKey: process.env.ENCRYPTION_KEY,
  signingKey: process.env.SIGNING_KEY,
  excludeFromEncryption: ['fileContentHash'],
});

module.exports = mongoose.model('File', fileSchema);
