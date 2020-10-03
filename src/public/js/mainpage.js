import $ from 'jquery';
import forge from 'forge';
import { getKeysFromStorage, updateHiddenFormContents } from './keymanagement';
import { showFailureMessage } from './showAlertMessage';

const doFileUpload = (e) => {
  e.preventDefault();
  const reader = new FileReader();
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
    document.forms.fileUpload.submit();
  };
  const file = $('#uploadFile').prop('files')[0];
  reader.readAsBinaryString(file);
  return false;
};

$(() => {
  $('#fileUpload').on('submit', doFileUpload);
  $('#recaptchaToken').on('change', doFileUpload);
  const fileInput = $('#uploadFileDiv input[type=file]');
  fileInput.on('change', () => {
    if (fileInput.prop('files').length > 0) {
      $('#uploadFileDiv .file-name').text(fileInput.prop('files')[0].name);
    }
  });
});
