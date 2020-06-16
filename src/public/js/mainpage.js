import $ from 'jquery';
import forge from 'node-forge';

const fileInput = document.querySelector('#uploadFileDiv input[type=file]');
fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    const fileName = document.querySelector('#uploadFileDiv .file-name');
    fileName.textContent = fileInput.files[0].name;
  }
};

$('#submitFileBtn').click((e) => {
  e.preventDefault();
  const { ed25519 } = forge.pki;

  const reader = new FileReader();
  reader.onload = function () {
    const fileContent = reader.result;
    const md = forge.md.sha1.create();
    md.update(fileContent);
    const fileContenthash = md.digest().toHex();
    const keypair = {
      publicKey: sessionStorage.pubkey,
      privateKey: sessionStorage.privkey,
    };

    if (!keypair.privateKey && !keypair.publicKey) {
      $('#navFailureMessage').html('Please upload/generate keys to upload file');
      $('#navFailure').show();
    } else {
      keypair.publicKey = new Uint8Array(keypair.publicKey.split(','));
      keypair.privateKey = new Uint8Array(keypair.privateKey.split(','));
      const signature = ed25519.sign({
        message: 'test',
        encoding: 'utf8',
        privateKey: keypair.privateKey,
      });
      console.log(fileContenthash);
      $('input[name="fileContentHash"]').val(fileContenthash);
      $('input[name="msg"]').val('test');
      $('input[name="signature"]').val(signature.toString());
      $('input[name="publicKey"]').val(keypair.publicKey.toString());
      document.forms.fileUpload.submit();
    }
  };
  const file = document.getElementById('uploadFile').files[0];
  reader.readAsBinaryString(file);
});
