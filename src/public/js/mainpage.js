import $ from 'jquery';
import forge from 'forge';
import { getKeysFromStorage, updateHiddenFormContents } from './keymanagement';
import { showSuccessMessage, showFailureMessage } from './showAlertMessage';

$('#submitFileBtn').click((e) => {
  e.preventDefault();
  const file = $('#uploadFile').prop('files')[0];
  if (!file) {
    showFailureMessage('File not selected');
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    let fileContent = reader.result;

    const keypair = getKeysFromStorage();
    if (!keypair) {
      showFailureMessage('Please login to upload file');
      return;
    }

    const key = forge.util.createBuffer(keypair.privateKey.slice(0,16));
    const iv = forge.util.createBuffer(keypair.privateKey.slice(16,33));
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv});
    cipher.update(forge.util.createBuffer(fileContent));
    cipher.finish();

    fileContent = cipher.output.getBytes();

    const md = forge.md.sha1.create();
    md.update(fileContent);
    const fileContentHash = md.digest().toHex();
    updateHiddenFormContents('fileUpload', fileContentHash);
    const fileUpload = document.getElementById('fileUpload');
    const formData = new FormData(fileUpload);
    formData.delete('uploadFile');
    
    formData.append('uploadFile', new Blob([fileContent]), file.name);
    fetch(fileUpload.getAttribute('action'), {
      method: fileUpload.getAttribute('method'),
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    }).then((res) => res.json().then(body => {
      if (body.success) {
        showSuccessMessage(body.message)
        $('#uploadFile').val('');
        $('#uploadFileDiv .file-name').text('File uploaded');
      } else showFailureMessage(body.message)
    })).catch(err => showFailureMessage(err));
  };
  reader.readAsBinaryString(file);
});

$(document).ready(() => {
  const fileInput = $('#uploadFileDiv input[type=file]');
  fileInput.change(() => {
    if (fileInput.prop('files').length > 0) {
      $('#uploadFileDiv .file-name').text(fileInput.prop('files')[0].name);
    }
  });
});
