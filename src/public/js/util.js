import { PUBKEY_STORAGE_KEY, PRIVKEY_STORAGE_KEY } from './defaults';

const logout = () => {
  sessionStorage.removeItem(PUBKEY_STORAGE_KEY);
  sessionStorage.removeItem(PRIVKEY_STORAGE_KEY);
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

/**
 *
 * @param {string} selector
 */
const hideElement = function (selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.display = 'none';
  });
};

/**
 *
 * @param {string} selector
 */
const showElement = function (selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.display = '';
  });
};

export { logout, downloadBlob, hideElement, showElement };
