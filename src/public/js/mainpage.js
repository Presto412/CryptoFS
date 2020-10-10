import forge from 'forge';
import { getKeysFromStorage, updateHiddenFormContents } from './keymanagement';
import { showFailureMessage } from './showAlertMessage';

const submitForm = () => document.forms.fileUpload.submit();
const doFileUpload = (e) => {
  e.preventDefault();
  const reader = new FileReader();
  const recaptchaEnabled = document.querySelectorAll('#recaptcha').length;
  reader.onload = () => {
    const fileContent = reader.result;
    const md = forge.md.sha1.create();
    md.update(fileContent);
    const fileContentHash = md.digest().toHex();
    const keypair = getKeysFromStorage();
    if (!keypair) {
      showFailureMessage('Please login to upload file');
      return;
    }
    updateHiddenFormContents('fileUpload', fileContentHash);
    if (recaptchaEnabled) {
      grecaptcha.execute();
    } else {
      submitForm();
    }
  };
  const file = document.querySelector('#uploadFile').files[0];
  reader.readAsBinaryString(file);
  return false;
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#fileUpload').addEventListener('submit', doFileUpload);
  window.submitForm = submitForm;

  const fileInput = document.querySelector('#uploadFileDiv input[type=file]');
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      document.querySelector('#uploadFileDiv .file-name').textContent = fileInput.files[0].name;
    }
  });
});
