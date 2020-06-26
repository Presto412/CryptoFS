import $ from 'jquery';
import { logout } from './util';
import {
  setKeyToStorage,
  generateKeyValuePair,
  getKeysFromStorage,
  deserializeKeyPair,
} from './keymanagement';
import { PUBKEY_STORAGE_KEY, PRIVKEY_STORAGE_KEY } from './defaults';
import { showFailureMessage, showSuccessMessage } from './showAlertMessage';

const login = () => {
  $('#keyManagementDiv').hide();
  $('#login').hide();
  $('#logout').show();
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
  $('input[name=keyUpload]').change(function (evt) {
    const reader = new FileReader();
    reader.onload = function () {
      const keyPair = deserializeKeyPair(reader.result);
      try {
        setKeyToStorage(PRIVKEY_STORAGE_KEY, keyPair.privateKey);
        setKeyToStorage(PUBKEY_STORAGE_KEY, keyPair.publicKey);
        showSuccessMessage('Key Successfully uploaded!');
        login();
      } catch (error) {
        showFailureMessage(error);
      }
    };
    reader.readAsText(evt.target.files[0]);
  });
});

export { showSuccessMessage, showFailureMessage };
