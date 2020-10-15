import { logout, showElement, hideElement } from './util';
import {
  setKeyToStorage,
  generateKeyValuePair,
  getKeysFromStorage,
  deserializeKeyPair,
} from './keymanagement';
import { PUBKEY_STORAGE_KEY, PRIVKEY_STORAGE_KEY } from './defaults';
import { showFailureMessage, showSuccessMessage } from './showAlertMessage';

const login = () => {
  hideElement('#keyManagementDiv');
  hideElement('#login');
  showElement('#logout');
};

hideElement('#navSuccess');
hideElement('#navFailure');
hideElement('#keyManagementDiv');

if (getKeysFromStorage()) {
  hideElement('#login');
  showElement('#logout');
} else {
  hideElement('#logout')
}

document.querySelector('#logout').addEventListener('click', () => {
      logout();
  window.location.reload();
});

document.querySelector('#login').addEventListener('click', () => {
  showElement('#keyManagementDiv');
});

document.querySelector('#generateKeyValuePairButton').addEventListener('click', () => {
  generateKeyValuePair();
  window.location.reload();
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('input[name=keyUpload]').addEventListener('change', (evt) => {
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
