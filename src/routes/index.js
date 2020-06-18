const express = require('express');

const router = express.Router();
const multer = require('multer');

const isVerified = require('../middleware/verify').DSVerify;
const multerConfig = require('../config/multer');
const userService = require('../service/user');
const fileService = require('../service/file');
const fileUtil = require('../util/file');

const upload = multer(multerConfig);

router.get('/', (req, res) => {
  res.render('index.ejs', {
    title: 'CryptoFS',
    success: true,
    message: '',
  });
});

router.post('/upload', upload.single('uploadFile'), isVerified, async (req, res, next) => {
  try {
    const { publicKey, filesUploaded } = req.user;
    const { fileContentHash } = req.body;
    const { originalname, mimetype, size, path } = req.file;

    const fileData = {
      fileContentHash,
      metaData: {
        filename: originalname,
        fileType: mimetype,
        size,
        dateUploaded: Date.now().toString(),
      },
    };

    const fileAlreadyPresent = await fileService.findFileByContentHash(fileContentHash);
    if (fileAlreadyPresent) {
      // file already exists, check if it is in current user's uploads
      const userFileHashes = filesUploaded.filter(
        (obj) => obj.fileContentHash === fileAlreadyPresent.fileContentHash
      );
      if (userFileHashes.length !== 0) {
        return res.render('index.ejs', {
          title: 'CryptoFS',
          success: false,
          message: 'File already exists',
        });
      }
      await userService.createOrUpdateUserFileData(publicKey, fileData);
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: true,
        message: 'File successfully linked',
      });
    }

    const generatedFileContentHash = await fileUtil.getFileHash(path);
    if (fileContentHash !== generatedFileContentHash) {
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: false,
        message: "File hash doesn't match sent hash",
      });
    }

    await userService.createOrUpdateUserFileData(publicKey, fileData);
    await fileService.createFile(fileContentHash, path);

    return res.render('index.ejs', {
      title: 'CryptoFS',
      success: true,
      message: 'Successfully uploaded file!',
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/list', (req, res) => {
  res.render('list', { success: true, message: '' });
});

router.get('/listFiles', isVerified, async (req, res, next) => {
  try {
    return res.json({
      map: req.user.filesUploaded || [],
      message: req.user.filesUploaded.length === 0 ? 'No files to show' : '',
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/download', isVerified, async (req, res, next) => {
  try {
    const { filesUploaded } = req.user;
    const { fileContentHash } = req.body;

    const userFileHashes = filesUploaded.filter((obj) => obj.fileContentHash === fileContentHash);
    if (userFileHashes.length === 0) {
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: false,
        message: 'Cannot access this file',
      });
    }
    const file = await fileService.findFileByContentHash(fileContentHash);

    if (!file) {
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: false,
        message: 'File not found',
      });
    }

    return res.download(file.paths[0], userFileHashes[0].metaData.filename);
  } catch (error) {
    return next(error);
  }
});

router.post('/delete', isVerified, async (req, res, next) => {
  try {
    const { fileContentHash } = req.body;
    const { filesUploaded } = req.user;

    req.user.filesUploaded = filesUploaded
      .toObject()
      .filter((o) => o.fileContentHash !== fileContentHash);
    await req.user.save();
    return res.render('list', { success: true, message: 'Successfully deleted file!' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
