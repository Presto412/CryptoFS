const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } = require('../config/env');

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});
const s3 = new AWS.S3();

var params = {
  Bucket: AWS_BUCKET_NAME,
};
// function promiseResolver(err, data) {}
exports.upload = async function (data) {
  params.Body = fs.createReadStream(data.path);
  const stuff = data.fileContentHash + '/' + path.basename(data.originalname);
  params.Key = stuff;
  const res = new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      //handle error
      if (err) {
        console.error(err);
        reject(err);
        return err;
      }

      //success
      if (data) {
        finalPath = data.Location;
        resolve(data.Key);
        return data.Location;
      }
    });
  });
  return await res;
};
exports.getData = async function ({ fileKey, res }) {
  var params = {
    Bucket: AWS_BUCKET_NAME,
  };
  params.Key = fileKey;

  const response = new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        const filePath = path.basename(fileKey);
        resolve({
          ...data,
          filePath,
        });
      }
    });
  });
  return await response;
};
exports.deleteData = async function (data) {
  const res = new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.error(err);
        reject(err);
      }

      //success
      if (data) {
        resolve(data.Location);
      }
    });
  });
  return await res;
};
