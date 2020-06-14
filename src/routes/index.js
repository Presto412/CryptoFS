var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({
  dest: "/tmp/uploads/",
  limits: { fileSize: process.env.MAX_FILE_SIZE || 1024 * 1024 * 1024 },
}); // 1 gb
const fs = require("fs");
const User = require("../models/user");
const File = require("../models/file");
const crypto = require("crypto");
const isVerified = require("../middleware/verify").DSVerify;

router.get("/", (req, res) => {
  res.render("index.ejs", {
    title: "CryptoFS",
    success: true,
    message: "",
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
    user.filesUploaded.push(fileData);
  }
  await user.save();
};
// map user to stuff

router.post("/checkHash", isVerified, async (req, res, next) => {
  let hash = await File.findOne({ fileContentHash: req.body.fileHash });
  if (!hash) {
    return res.json({
      success: false,
      message: "Hash not found",
    });
  }
  return res.json({
    success: true,
    message: "File already exists",
  });
});

const getFileHash = (path) => {
  return new Promise(function (resolve, reject) {
    const hash = crypto.createHash("sha1");
    const input = fs.createReadStream(path);

    input.on("error", reject);

    input.on("data", function (chunk) {
      hash.update(chunk);
    });

    input.on("close", function () {
      resolve(hash.digest("hex"));
    });
  });
};

router.post(
  "/upload",
  upload.single("uploadFile"),
  isVerified,
  async (req, res, next) => {
    try {
      const time1 = Date.now();
      let hash = await File.findOne({
        fileContentHash: req.body.fileContentHash,
      });
      let fileData = {
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
          return res.render("index.ejs", {
            title: "CryptoFS",
            success: false,
            message: "File already exists",
          });
        }
        await createOrUpdateUser(req.user.publicKey, fileData);
        return res.render("index.ejs", {
          title: "CryptoFS",
          success: true,
          message: "File successfully linked",
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
      const time2 = Date.now();
      console.log("Time difference", time2 - time1);
      return res.render("index.ejs", {
        title: "CryptoFS",
        success: true,
        message: "Successfully uploaded file!",
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/list", (req, res) => {
  res.render("list", { map: [], message: "" });
});

router.get("/listFiles", isVerified, async (req, res, next) => {
  try {
    res.json({
      map: req.user.filesUploaded || [],
      message: req.user.filesUploaded.length === 0 ? "No files to show" : "",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/download", isVerified, async (req, res, next) => {
  try {
    const time1 = Date.now();

    const userFileHashes = req.user.filesUploaded.filter(
      (obj) => obj.fileContentHash === req.body.fileContentHash
    );
    if (userFileHashes.length === 0) {
      return res.render("index.ejs", {
        title: "CryptoFS",
        success: false,
        message: "Cannot access this file",
      });
    }

    const file = await File.findOne({
      fileContentHash: req.body.fileContentHash,
    });

    if (!file)
      return res.render("index.ejs", {
        title: "CryptoFS",
        success: false,
        message: "File not found",
      });

    const time2 = Date.now();
    console.log("time taken for download", time2 - time1);
    return res.download(file.paths[0], userFileHashes[0].metaData.filename);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
