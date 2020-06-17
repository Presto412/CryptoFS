const File = require('../models/file');

const findFileByContentHash = async (fileContentHash) => {
  try {
    const file = await File.findOne({ fileContentHash });
    return file;
  } catch (error) {
    return Promise.reject(error);
  }
};

const createFile = async (fileContentHash, path) => {
  try {
    const file = new File({
      fileContentHash,
      paths: [path],
    });
    await file.save();
    return file;
  } catch (error) {
    return Promise.reject(error);
  }
};
module.exports = { findFileByContentHash, createFile };
