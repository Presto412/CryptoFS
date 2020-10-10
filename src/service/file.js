const File = require('../models/file');
const { upload } = require('./aws');
const { S3_BUCKET_ENABLED } = require('../config/env');

const findFileByContentHash = async (fileContentHash) => {
  try {
    const file = await File.findOne({ fileContentHash });
    return file;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createFile = async (fileContentHash, path, originalname) => {
  try {
    let aws;
    if (S3_BUCKET_ENABLED) {
      aws = await upload({ fileContentHash, path, originalname });
    } else {
      aws = [path];
    }
    const file = new File({
      fileContentHash,
      paths: aws,
    });
    await file.save();
    return file;
  } catch (error) {
    return Promise.reject(error);
  }
};
module.exports = { findFileByContentHash, createFile };
