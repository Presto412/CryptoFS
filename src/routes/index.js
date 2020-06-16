const express = require('express');

const router = express.Router();
const multer = require('multer');

const upload = multer({
  dest: process.env.UPLOAD_PATH || '/tmp/uploads/',
  limits: { fileSize: process.env.MAX_FILE_SIZE || 1024 * 1024 * 10 },
}); // 10 mb
const fs = require('fs');
const crypto = require('crypto');
const User = require('../models/user');
const File = require('../models/file');
const isVerified = require('../middleware/verify').DSVerify;

router.get('/', (req, res) => {
  res.render('index.ejs', {
    title: 'CryptoFS',
    success: true,
    message: '',
  });
});

const createOrUpdateUser = async (publicKey, fileData) => {
  let user = await User.findOne({ publicKey });
  if (!user) {
    user = new User({
      publicKey,
      filesUploaded: [fileData],
    });
  } else {
    if (user.filesUploaded.length === process.env.MAX_NUM_UPLOADS) {
      throw new Error(
        `Max upload limit reached. Can only upload a maximum of ${process.env.MAX_NUM_UPLOADS} files.`
      );
    }
    user.filesUploaded.push(fileData);
  }
  await user.save();
};

const getFileHash = (path) => {
  return new Promise(function (resolve, reject) {
    const hash = crypto.createHash('sha1');
    const input = fs.createReadStream(path);

    input.on('error', reject);

    input.on('data', function (chunk) {
      hash.update(chunk);
    });

    input.on('close', function () {
      resolve(hash.digest('hex'));
    });
  });
};

router.post('/upload', upload.single('uploadFile'), isVerified, async (req, res, next) => {
  try {
    const hash = await File.findOne({
      fileContentHash: req.body.fileContentHash,
    });
    const fileData = {
      fileContentHash: req.body.fileContentHash,
      metaData: {
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        size: req.file.size,
        dateUploaded: Date.now().toString(),
      },
    };
    if (hash) {
      // file already exists, check if it is in current user's uploads
      const userFileHashes = req.user.filesUploaded.filter(
        (obj) => obj.fileContentHash === hash.fileContentHash
      );
      if (userFileHashes.length !== 0) {
        return res.render('index.ejs', {
          title: 'CryptoFS',
          success: false,
          message: 'File already exists',
        });
      }
      await createOrUpdateUser(req.user.publicKey, fileData);
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: true,
        message: 'File successfully linked',
      });
    }
    const fileContentHash = await getFileHash(req.file.path);
    await createOrUpdateUser(req.user.publicKey, fileData);
    let file = await File.findOne({ fileContentHash });
    if (!file) {
      file = new File({
        fileContentHash,
        paths: [req.file.path],
      });
      await file.save();
    }
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
  res.render('list', { message: '' });
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
    const userFileHashes = req.user.filesUploaded.filter(
      (obj) => obj.fileContentHash === req.body.fileContentHash
    );
    if (userFileHashes.length === 0) {
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: false,
        message: 'Cannot access this file',
      });
    }

    const file = await File.findOne({
      fileContentHash: req.body.fileContentHash,
    });

    if (!file)
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: false,
        message: 'File not found',
      });

    return res.download(file.paths[0], userFileHashes[0].metaData.filename);
  } catch (error) {
    return next(error);
  }
});

router.post('/delete', isVerified, async (req, res, next) => {
  try {
    const { fileContentHash } = req.body;
    req.user.filesUploaded = req.user.filesUploaded
      .toObject()
      .filter((o) => o.fileContentHash !== fileContentHash);
    await req.user.save();
    return res.render('list', { message: 'Deleted file!' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
