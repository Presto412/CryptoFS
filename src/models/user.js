const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const userSchema = mongoose.Schema(
  {
    publicKey: String,
    filesUploaded: [
      {
        fileContentHash: String,
        metaData: {
          filename: String,
          dateUploaded: String,
          size: String
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.plugin(encrypt, {
  encryptionKey: process.env.ENCRYPTION_KEY,
  signingKey: process.env.SIGNING_KEY,
  excludeFromEncryption: ["publicKey"]
});

module.exports = mongoose.model("User", userSchema);
