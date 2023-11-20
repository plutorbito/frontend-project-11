import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';

const formEl = document.querySelector('.rss-form');
const inputEl = document.querySelector('#url-input');

const state = {
  status: '',
  errors: '',
  urls: [],
};

const validate = (fields, array) => {
  const schema = yup.string().url().required().notOneOf(array);
  try {
    schema.validateSync(fields, { abortEarly: false });
    return '';
  } catch (e) {
    return e.message;
  }
};

const render = () => (path, value) => {
  if (path === 'errors' && value) {
    inputEl.classList.add('is-invalid');
    document.querySelector('.feedback').textContent = value;
  } else if (path === 'status' && value === 'valid') {
    inputEl.classList.remove('is-invalid');
    inputEl.focus();
    formEl.reset();
    document.querySelector('.feedback').textContent = '';
  }
};

const watchedState = onChange(state, render());

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  const validationError = validate(url, state.urls);
  if (validationError) {
    watchedState.errors = validationError;
    watchedState.status = 'invalid';
  } else {
    watchedState.errors = '';
    watchedState.urls.push(url);
    watchedState.status = 'valid';
  }
  console.log(state);
});
