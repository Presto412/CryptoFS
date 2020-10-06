const File = require('../models/file');
const { upload } = require('./aws');
const path = require('path');
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
    const aws = await upload({ fileContentHash, path, originalname });
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
