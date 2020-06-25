import $ from 'jquery';

export const showSuccessMessage = (message) => {
  $('#navSuccessMessage').html(message);
  $('#navSuccess').show();
};
export const showFailureMessage = (message) => {
  $('#navFailureMessage').html(message);
  $('#navFailure').show();
};
