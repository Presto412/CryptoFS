import forge from 'node-forge';
import $ from 'jquery';
import {
  DEFAULT_MESSAGE,
  DEFAULT_ENCODING,
  PUBKEY_STORAGE_KEY,
  PRIVKEY_STORAGE_KEY,
} from './defaults';
import { downloadBlob } from './util';

const setKeyToStorage = (type, value) => {
  if (type !== PUBKEY_STORAGE_KEY && type !== PRIVKEY_STORAGE_KEY) {
    return false;
  }
  if (value.length !== 64 && !(value instanceof Uint8Array)) {
    return false;
  }

  sessionStorage.setItem(type, new Uint8Array(value).toString());
  return true;
};

const generateKeyValuePair = () => {
  const keypair = forge.pki.ed25519.generateKeyPair();
  downloadBlob(keypair.publicKey, 'cryptoFs.pub.key', 'application/octet-stream');
  downloadBlob(keypair.privateKey, 'cryptoFs.priv.key', 'application/octet-stream');
  setKeyToStorage(PUBKEY_STORAGE_KEY, keypair.publicKey);
  setKeyToStorage(PRIVKEY_STORAGE_KEY, keypair.privateKey);
  return keypair;
};

const getKeysFromStorage = () => {
  const keypair = {
    publicKey: sessionStorage.pubkey,
    privateKey: sessionStorage.privkey,
  };
  if (!keypair.publicKey && !keypair.publicKey) {
    return null;
  }
  keypair.publicKey = new Uint8Array(keypair.publicKey.split(','));
  keypair.privateKey = new Uint8Array(keypair.privateKey.split(','));
  return keypair;
};

const getSignedMessage = (message = DEFAULT_MESSAGE, encoding = DEFAULT_ENCODING) => {
  const { privateKey } = getKeysFromStorage();
  if (!privateKey) {
    return null;
  }
  return new Uint8Array(
    forge.pki.ed25519.sign({
      message,
      encoding,
      privateKey,
    })
  );
};

const updateHiddenFormContents = (
  formId,
  fileContentHash,
  publicKey = getKeysFromStorage().publicKey,
  signature = getSignedMessage(),
  message = DEFAULT_MESSAGE
) => {
  $(`#${formId} input[name="fileContentHash"]`).val(fileContentHash);
  $(`#${formId} input[name="msg"]`).val(message);
  $(`#${formId} input[name="signature"]`).val(signature.toString());
  $(`#${formId} input[name="publicKey"]`).val(publicKey.toString());
};

export {
  getKeysFromStorage,
  getSignedMessage,
  setKeyToStorage,
  generateKeyValuePair,
  updateHiddenFormContents,
};
