const express = require('express');

const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const https = require('https');

const isVerified = require('../middleware/verify').DSVerify;
const multerConfig = require('../config/multer');
const envConfig = require('../config/env');
const userService = require('../service/user');
const fileService = require('../service/file');
const fileUtil = require('../util/file');
const { getData } = require('../service/aws');
const {S3_BUCKET_ENABLED} = require('../config/env')
const upload = multer(multerConfig);

const recaptchaValidate = (secretKey, token) =>
  new Promise((resolve, reject) => {
    let body = '';
    const request = https.request(
      {
        hostname: 'www.google.com',
        path: `/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
        method: 'POST',
      },
      (response) => {
        response.on('data', (d) => (body += d));
        response.on('end', () => {
          const parsedBody = JSON.parse(body);
          if (response.statusCode === 200) {
            resolve(parsedBody);
          } else {
            reject(parsedBody);
          }
        });
      }
    );
    request.end();
  });

router.get('/', (req, res) => {
  res.render('index.ejs', {
    title: 'CryptoFS',
    success: true,
    message: '',
    recaptchaEnabled: envConfig.RECAPTCHA_ENABLED,
    recaptchaSiteKey: envConfig.RECAPTCHA_SITE_KEY,
  });
});

router.post('/upload', upload.single('uploadFile'), isVerified, async (req, res, next) => {
  try {
    const { publicKey, filesUploaded } = req.user;
    const { fileContentHash, ['g-recaptcha-response']: recaptchaToken } = req.body;
    const { originalname, mimetype, size, path } = req.file;
    const recaptchaEnabled = envConfig.RECAPTCHA_ENABLED;
    const recaptchaSiteKey = envConfig.RECAPTCHA_SITE_KEY;

    if (recaptchaEnabled) {
      const recaptchaResult = await recaptchaValidate(
        envConfig.RECAPTCHA_SECRET_KEY,
        recaptchaToken
      );
      if (!recaptchaResult.success) {
        return res.render('index.ejs', {
          title: 'CryptoFS',
          success: false,
          message: 'Recaptcha validation failed',
          recaptchaEnabled,
          recaptchaSiteKey,
        });
      }
    }

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
          recaptchaEnabled,
          recaptchaSiteKey,
        });
      }
      await userService.createOrUpdateUserFileData(publicKey, fileData);
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: true,
        message: 'File successfully linked',
        recaptchaEnabled,
        recaptchaSiteKey,
      });
    }

    const generatedFileContentHash = await fileUtil.getFileHash(path);
    if (fileContentHash !== generatedFileContentHash) {
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: false,
        message: "File hash doesn't match sent hash",
        recaptchaEnabled,
        recaptchaSiteKey,
      });
    }

    await userService.createOrUpdateUserFileData(publicKey, fileData);
    await fileService.createFile(fileContentHash, path, originalname);

    return res.render('index.ejs', {
      title: 'CryptoFS',
      success: true,
      message: 'Successfully uploaded file!',
      recaptchaEnabled,
      recaptchaSiteKey,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/list', (req, res) => {
  res.render('list', { success: true, message: '', recaptchaEnabled: false });
});

router.get('/listFiles', isVerified, async (req, res, next) => {
  try {
    return res.json({
      map: req.user.filesUploaded || [],
      message: req.user.filesUploaded.length === 0 ? 'No files to show' : '',
      recaptchaEnabled: false,
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
        recaptchaEnabled: false,
      });
    }
    const file = await fileService.findFileByContentHash(fileContentHash);

    if (!file) {
      return res.render('index.ejs', {
        title: 'CryptoFS',
        success: false,
        message: 'File not found',
        recaptchaEnabled: false,
      });
    }
    if(S3_BUCKET_ENABLED){
      const { filePath, Body } = await getData({ fileKey: file.paths[0], res });
    fs.writeFileSync(filePath, Body);
    res.download(filePath, function (err) {
      if (err) {
      } else {
        // decrement a download credit, etc. // here remove temp file
        fs.unlink(filePath, function (err) {
          if (err) {
            console.error(err);
          }
          console.log('Temp File Delete');
        });
      }
    });
    }else {
    return res.download(file.paths[0], userFileHashes[0].metaData.filename);
    }
    
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
    return res.render('list', {
      success: true,
      message: 'Successfully deleted file!',
      recaptchaEnabled: false,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
