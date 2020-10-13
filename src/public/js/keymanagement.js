import forge from 'forge';
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

const serializeKeyPair = (keypair) => {
  const jsonKeyPair = {
    publicKey: keypair.publicKey.toString(),
    privateKey: keypair.privateKey.toString(),
  };
  return JSON.stringify(jsonKeyPair);
};

const generateKeyValuePair = () => {
  const keypair = forge.pki.ed25519.generateKeyPair();
  const jsonKeyPair = serializeKeyPair(keypair);
  downloadBlob(jsonKeyPair, 'cryptoFs-keypair.json', 'application/json');
  setKeyToStorage(PUBKEY_STORAGE_KEY, keypair.publicKey);
  setKeyToStorage(PRIVKEY_STORAGE_KEY, keypair.privateKey);
  return keypair;
};

const deserializeKeyPair = (keypair) => {
  const keyPairAsObject = JSON.parse(keypair);
  keyPairAsObject.publicKey = new Uint8Array(keyPairAsObject.publicKey.split(','));
  keyPairAsObject.privateKey = new Uint8Array(keyPairAsObject.privateKey.split(','));
  return keyPairAsObject;
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
  document.querySelector(`#${formId} input[name="fileContentHash"]`).value = fileContentHash;
  document.querySelector(`#${formId} input[name="msg"]`).value = message;
  document.querySelector(`#${formId} input[name="signature"]`).value = signature.toString();
  document.querySelector(`#${formId} input[name="publicKey"]`).value = publicKey.toString();
};

export {
  getKeysFromStorage,
  getSignedMessage,
  setKeyToStorage,
  generateKeyValuePair,
  updateHiddenFormContents,
  serializeKeyPair,
  deserializeKeyPair,
};
