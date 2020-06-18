import $ from 'jquery';
import { logout } from './util';
import { setKeyToStorage, generateKeyValuePair, getKeysFromStorage } from './keymanagement';
import { PUBKEY_STORAGE_KEY, PRIVKEY_STORAGE_KEY } from './defaults';

const login = () => {
  $('#keyManagementDiv').hide();
  $('#login').hide();
  $('#logout').show();
};

const showSuccessMessage = (message) => {
  $('#navSuccessMessage').html(message);
  $('#navSuccess').show();
};

const showFailureMessage = (message) => {
  $('#navFailureMessage').html(message);
  $('#navFailure').show();
};

$('#navSuccess').hide();
$('#navFailure').hide();
$('#keyManagementDiv').hide();

if (getKeysFromStorage()) {
  $('#login').hide();
  $('#logout').show();
} else {
  $('#logout').hide();
}

$('#logout').click(() => {
  logout();
  window.location.reload();
});

$('#login').click(() => {
  $('#keyManagementDiv').show();
});

$('#generateKeyValuePairButton').click(() => {
  generateKeyValuePair();
  window.location.reload();
});

$(document).ready(() => {
  $('input[name=privateKeyUpload]').change(function (evt) {
    const reader = new FileReader();
    reader.onload = function () {
      const keyArray = new Uint8Array(reader.result);
      if (!setKeyToStorage(PRIVKEY_STORAGE_KEY, keyArray)) {
        showFailureMessage('Incorrect key uploaded. Private key must be 64 bytes length');
      } else {
        $('#UploadPrivKeyDiv').hide();
        if ($('#UploadPubKeyDiv').is(':hidden')) {
          login();
        }
        showSuccessMessage.html('Successfully uploaded private key');
      }
    };
    reader.readAsArrayBuffer(evt.target.files[0]);
  });
  $('input[name=publicKeyUpload]').change(function (evt) {
    const reader = new FileReader();
    reader.onload = function () {
      const keyArray = new Uint8Array(reader.result);
      if (!setKeyToStorage(PUBKEY_STORAGE_KEY, keyArray)) {
        showFailureMessage('Incorrect key uploaded. Public key must be 64 bytes length');
      } else {
        $('#UploadPubKeyDiv').hide();
        if ($('#UploadPrivKeyDiv').is(':hidden')) {
          login();
        }
        showSuccessMessage('Successfully uploaded public key');
      }
    };
    reader.readAsArrayBuffer(evt.target.files[0]);
  });
});

export { showSuccessMessage, showFailureMessage };
