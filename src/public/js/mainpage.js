import $ from 'jquery';
import forge from 'forge';
import { getKeysFromStorage, updateHiddenFormContents } from './keymanagement';
import { showFailureMessage } from './showAlertMessage';

const submitForm = () => document.forms.fileUpload.submit();
const doFileUpload = (e) => {
  e.preventDefault();
  const reader = new FileReader();
  const recaptchaEnabled = $('#recaptcha').length;
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
  const file = $('#uploadFile').prop('files')[0];
  reader.readAsBinaryString(file);
  return false;
};

$(() => {
  $('#fileUpload').on('submit', doFileUpload);
  window.submitForm = submitForm;
  const fileInput = $('#uploadFileDiv input[type=file]');
  fileInput.on('change', () => {
    if (fileInput.prop('files').length > 0) {
      $('#uploadFileDiv .file-name').text(fileInput.prop('files')[0].name);
    }
  });
});
