import $ from 'jquery';
import forge from 'node-forge';

const logout = () => {
  sessionStorage.removeItem('pubkey');
  sessionStorage.removeItem('privkey');
  window.location.href = '/';
};

const downloadURL = function (data, fileName) {
  const a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};

const downloadBlob = function (data, fileName, mimeType) {
  const blob = new Blob([data], {
    type: mimeType,
  });
  const url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function () {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

let keysUploaded = 0;

$('input[name=publicKeyUpload]').change(function (evt) {
  const reader = new FileReader();
  reader.onload = function () {
    const keyArray = new Uint8Array(reader.result);
    console.log(keyArray.length);

    if (keyArray.length === 32) {
      sessionStorage.setItem('pubkey', new Uint8Array(reader.result));
      $('#UploadPubKeyDiv').hide();
      $('#navSuccessMessage').html('Successfully uploaded key');
      $('#navSuccess').show();
      keysUploaded += 1;
      if (keysUploaded === 1) {
        $('#navSuccessMessage').html('Successfully uploaded key. Upload private key.');
        $('#navSuccess').show();
      } else if (keysUploaded === 2) {
        $('#keyManagementDiv').hide();
      }
    } else {
      $('#navFailureMessage').html('Incorrect length. Public key must be 32 bytes length');
      $('#navFailure').show();
    }
  };
  reader.readAsArrayBuffer(evt.target.files[0]);
});

$('input[name=privateKeyUpload]').change(function (evt) {
  const reader = new FileReader();
  reader.onload = function () {
    const keyArray = new Uint8Array(reader.result);
    console.log(keyArray.byteLength);

    if (keyArray.length === 64) {
      sessionStorage.setItem('privkey', new Uint8Array(reader.result));
      $('#UploadPrivKeyDiv').hide();
      keysUploaded += 1;
      if (keysUploaded === 1) {
        $('#navSuccessMessage').html('Successfully uploaded key. Upload public key.');
        $('#navSuccess').show();
      } else if (keysUploaded === 2) {
        $('#keyManagementDiv').hide();
      }
    } else {
      $('#navFailureMessage').html('Incorrect length. Public key must be 64 bytes length');
      $('#navFailure').show();
    }
  };
  reader.readAsArrayBuffer(evt.target.files[0]);
});

const generateKeyValuePair = () => {
  const keypair = forge.pki.ed25519.generateKeyPair();
  downloadBlob(keypair.publicKey, 'cryptoFs.pub.key', 'application/octet-stream');
  downloadBlob(keypair.privateKey, 'cryptoFs.priv.key', 'application/octet-stream');
  sessionStorage.setItem('pubkey', keypair.publicKey);
  sessionStorage.setItem('privkey', keypair.privateKey);
  $('#keyManagementDiv').hide();
  return keypair;
};

$('#navSuccess').hide();
$('#navFailure').hide();
if (sessionStorage.getItem('pubkey') && sessionStorage.getItem('privkey')) {
  $('#keyManagementDiv').hide();
}
$('#logout').click(() => logout());

export { generateKeyValuePair, logout };
