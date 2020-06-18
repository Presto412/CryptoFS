import $ from 'jquery';
import { getSignedMessage, getKeysFromStorage, updateHiddenFormContents } from './keymanagement';
import { DEFAULT_MESSAGE } from './defaults';
import { showFailureMessage } from './nav';

const downloadFile = (fileContentHash) => {
  updateHiddenFormContents('fileDownload', fileContentHash);
  document.forms.fileDownload.submit();
};

const deleteFile = (fileContentHash) => {
  updateHiddenFormContents('fileDelete', fileContentHash);
  document.forms.fileDelete.submit();
};

$(document).ready(function () {
  const keyPair = getKeysFromStorage();
  if (!keyPair) {
    showFailureMessage('Please login to view list');
    return;
  }
  const signature = getSignedMessage();
  const { publicKey } = keyPair;
  $.ajax({
    type: 'GET',
    url: '/listFiles',
    headers: {
      msg: DEFAULT_MESSAGE,
      signature: signature.toString(),
      publicKey: publicKey.toString(),
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
        $(downloadButton).click(() => {
          downloadFile(element.fileContentHash);
        });
        downloadButton.setAttribute('class', 'button is-info listDownloadButton');
        downloadButton.innerHTML = 'Download';
        td4.appendChild(downloadButton);
        const td5 = document.createElement('td');
        const deleteButton = document.createElement('button');
        $(deleteButton).click(() => {
          deleteFile(element.fileContentHash);
        });
        deleteButton.setAttribute('class', 'button is-danger listDeleteButton');
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
      showFailureMessage(response.toString());
    },
  });
});

/**
 * alert-manager
 * authentication
 */
