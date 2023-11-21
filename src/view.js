export default (elements) => (path, value) => {
  if (path === 'errors' && value) {
    elements.inputEl.classList.add('is-invalid');
    document.querySelector('.feedback').textContent = value;
  } else if (path === 'status' && value === 'valid') {
    elements.inputEl.classList.remove('is-invalid');
    elements.inputEl.focus();
    elements.formEl.reset();
    document.querySelector('.feedback').textContent = '';
  }
};
