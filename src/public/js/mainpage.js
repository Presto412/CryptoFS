import forge from 'forge';
import { getKeysFromStorage, updateHiddenFormContents } from './keymanagement';
import { showSuccessMessage, showFailureMessage } from './showAlertMessage';

const submitForm = () => {
  const file = document.querySelector('#uploadFile').files[0];
  if (!file) {
    showFailureMessage('File not selected');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    let fileContent = reader.result;

    const keypair = getKeysFromStorage();
    if (!keypair) {
      showFailureMessage('Please login to upload file');
      return;
    }

    const key = forge.util.createBuffer(keypair.privateKey.slice(0, 16));
    const iv = forge.util.createBuffer(keypair.privateKey.slice(16, 33));
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(fileContent));
    cipher.finish();

    fileContent = cipher.output.getBytes();

    const md = forge.md.sha1.create();
    md.update(forge.util.encodeUtf8(fileContent));
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
    }).then((res) =>
      res.json().then((body) => {
        if (body.success) {
          showSuccessMessage(body.message);
          document.querySelector('#uploadFile').value = '';
          document.querySelector('#uploadFileDiv .file-name').textContent = 'File uploaded';
        } else {
          showFailureMessage(body.message);
        }
      }))
      .catch(err => showFailureMessage(err));
  };
  reader.readAsBinaryString(file);
}

const doFileUpload = (e) => {
  e.preventDefault();
  const recaptchaEnabled = document.querySelectorAll('#recaptcha').length;
  if (recaptchaEnabled) {
    grecaptcha.execute();
  } else {
    submitForm();
  }
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
