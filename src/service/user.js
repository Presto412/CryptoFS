const envConfig = require('../config/env');
const User = require('../models/user');

const createOrUpdateUserFileData = async (publicKey, fileData) => {
  try {
    let user = await User.findOne({ publicKey });
    if (!user) {
      user = new User({
        publicKey,
        filesUploaded: [fileData],
      });
    } else {
      if (user.filesUploaded.length === envConfig.MAX_NUM_UPLOADS) {
        throw new Error(
          `Max upload limit reached. Can only upload a maximum of ${envConfig.MAX_NUM_UPLOADS} files.`
        );
      }
      user.filesUploaded.push(fileData);
    }
    await user.save();
    return user;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = { createOrUpdateUserFileData };
