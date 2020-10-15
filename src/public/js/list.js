import { getSignedMessage, getKeysFromStorage, updateHiddenFormContents } from './keymanagement';
import { DEFAULT_MESSAGE } from './defaults';
import { showFailureMessage } from './nav';
import { downloadBlob } from './util';

const downloadFile = (fileContentHash, filename) => {
  const keyPair = getKeysFromStorage();
  if (!keyPair) {
    showFailureMessage('Please login to upload file');
    return;
  }

  const fileDownload = document.getElementById('fileDownload');
  const signature = getSignedMessage();
  const { publicKey } = keyPair;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const formData = new URLSearchParams({
    msg: DEFAULT_MESSAGE,
    signature: signature.toString(),
    publicKey: publicKey.toString(),
    fileContentHash,
  });

  fetch(fileDownload.getAttribute('action'), {
    method: fileDownload.getAttribute('method'),
    body: formData,
    headers,
  }).then((res) => res.blob()).then(blob => blob.text()).then(blob => {
    const key = forge.util.createBuffer(keyPair.privateKey.slice(0, 16));
    const iv = forge.util.createBuffer(keyPair.privateKey.slice(16, 33));
    const cipher = forge.cipher.createDecipher('AES-CBC', key);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(blob));
    cipher.finish();
    const fileContent = Buffer.from(cipher.output.getBytes(), 'binary');
    downloadBlob(fileContent, filename, 'application/octet-stream');
  });
};

const deleteFile = (fileContentHash) => {
  updateHiddenFormContents('fileDelete', fileContentHash);
  document.forms.fileDelete.submit();
};

const formatDate = (milliseconds) => {
  const date = new Date(parseInt(milliseconds, 10));
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const keyPair = getKeysFromStorage();
  if (!keyPair) {
    showFailureMessage('Please login to view list');
    return;
  }
  const signature = getSignedMessage();
  const { publicKey } = keyPair;

  fetch('/listFiles', {
    method: 'GET',
    headers: {
      msg: DEFAULT_MESSAGE,
      signature: signature.toString(),
      publicKey: publicKey.toString(),
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
    .then(res => res.json())
    .then(response => {
      const tableBody = document.querySelector('#table1 tbody');
      tableBody.textContent = '';
      response.map.forEach(element => {
        const tr = document.createElement('tr');

        const td1 = document.createElement('td');
        td1.innerHTML = element.metaData.filename;
        const td2 = document.createElement('td');
        td2.title = element.metaData.dateUploaded;
        td2.innerHTML = formatDate(element.metaData.dateUploaded);
        const td3 = document.createElement('td');
        td3.innerHTML = element.fileContentHash;

        const td4 = document.createElement('td');
        const downloadButton = document.createElement('button');
        downloadButton.addEventListener('click', () => {
          downloadFile(element.fileContentHash, element.metaData.filename);
        });
        downloadButton.setAttribute('class', 'button is-info listDownloadButton');
        downloadButton.innerHTML = 'Download';
        td4.appendChild(downloadButton);

        const td5 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', () => {
          deleteFile(element.fileContentHash);
        })
        deleteButton.setAttribute('class', 'button is-danger listDeleteButton');
        deleteButton.innerHTML = 'Delete';
        td5.appendChild(deleteButton);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tableBody.appendChild(tr);
      });
    })
    .catch(err => {
      showFailureMessage(err.toString());
    });
});

/**
 * alert-manager
 * authentication
 */
