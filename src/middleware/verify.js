var forge = require("node-forge");
var ed25519 = forge.ed25519;
var User = require("../models/user");

module.exports.DSVerify = async function(req, res, next) {
  let signature = req.body.signature ? req.body.signature : req.headers.signature;
  let publicKey = req.body.publicKey ? req.body.publicKey : req.headers.publickey;
  let msg = req.body.msg ? req.body.msg : req.headers.msg;
  var verified = ed25519.verify({
    message: msg,
    encoding: "utf8",
    // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
    signature: new Uint8Array(signature.split(",")),
    // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
    publicKey: new Uint8Array(publicKey.split(","))
  });
  if (verified) {
    var user = await User.findOne({ publicKey }).populate('filesUploaded');
    if (user) {
      req.user = user;
    } else {
      user = new User();
      user.publicKey = publicKey;
      await user.save();
      req.user = user;
    }
    return next();
  } else {
    return next(new Error("Not a valid user"));
  }
};
