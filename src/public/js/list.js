import $ from 'jquery';
import forge from 'node-forge';

const { ed25519 } = forge.pki;
const keypair = {
  publicKey: sessionStorage.pubkey,
  privateKey: sessionStorage.privkey,
};

let signature;
const updateFormContents = (formId, fileContentHash) => {
  $(`#${formId} input[name="fileContentHash"]`).val(fileContentHash);
  $(`#${formId} input[name="msg"]`).val('test');
  $(`#${formId} input[name="signature"]`).val(signature.toString());
  $(`#${formId} input[name="publicKey"]`).val(keypair.publicKey.toString());
};

const downloadFile = (fileContentHash) => {
  updateFormContents('fileDownload', fileContentHash);
  document.forms.fileDownload.submit();
};
const deleteFile = (fileContentHash) => {
  updateFormContents('fileDelete', fileContentHash);
  document.forms.fileDelete.submit();
};

if (!keypair.privateKey && !keypair.publicKey) {
  $('#navFailureMessage').html('Please upload/generate keys to view list');
  $('#navFailure').show();
} else {
  keypair.publicKey = new Uint8Array(keypair.publicKey.split(','));
  keypair.privateKey = new Uint8Array(keypair.privateKey.split(','));
  signature = ed25519.sign({
    message: 'test',
    encoding: 'utf8',
    privateKey: keypair.privateKey,
  });
}

$(document).ready(function () {
  if (keypair.publicKey && keypair.privateKey) {
    $.ajax({
      type: 'GET',
      url: '/listFiles',
      headers: {
        msg: 'test',
        signature,
        publickey: keypair.publicKey,
      },
      contentType: 'application/json;charset=utf-8',
      success(response) {
        const table = document.getElementById('table1');
        response.map.forEach(function (element) {
          const tr = document.createElement('tr');
          const td1 = document.createElement('td');
          td1.innerHTML = element.metaData.filename;
          const td2 = document.createElement('td');
          td2.innerHTML = element.metaData.dateUploaded;
          const td3 = document.createElement('td');
          td3.innerHTML = element.fileContentHash;
          const td4 = document.createElement('td');
          const downloadButton = document.createElement('button');
          downloadButton.setAttribute('onclick', downloadFile(element.fileContentHash));
          downloadButton.setAttribute('class', 'button is-info listButton');
          downloadButton.innerHTML = 'Download';
          td4.appendChild(downloadButton);
          const td5 = document.createElement('td');
          const deleteButton = document.createElement('button');
          deleteButton.setAttribute('onclick', deleteFile(element.fileContentHash));
          deleteButton.setAttribute('class', 'button is-danger listButton');
          deleteButton.innerHTML = 'Delete';
          td5.appendChild(deleteButton);
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tr.appendChild(td4);
          tr.appendChild(td5);
          table.appendChild(tr);
        });
      },
      error(response) {
        console.log(response);
      },
    });
  }
});
