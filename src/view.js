export default (elements) => (path, value) => {
  if (path === 'errors' && value) {
    elements.inputEl.classList.add('is-invalid');
    elements.feedbackEl.textContent = value;
  } else if (path === 'status' && value === 'valid') {
    elements.inputEl.classList.remove('is-invalid');
    elements.inputEl.focus();
    elements.formEl.reset();
    elements.feedbackEl.textContent = '';
  }
};
