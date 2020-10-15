import { showElement } from './util';

export const showSuccessMessage = (message) => {
  document.querySelector('#navSuccessMessage').innerHTML = message;
  showElement('#navSuccess');
};

export const showFailureMessage = (message) => {
  document.querySelector('#navFailureMessage').innerHTML = message;
  showElement('#navFailure');
};
