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

const validate = (field, array) => {
  const schema = yup.string().url().required().notOneOf(array);
  return schema.validate(field);
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
  validate(url, state.urls)
    .then(() => {
      watchedState.errors = '';
      watchedState.status = 'valid';
      watchedState.urls.push(url);
    })
    .catch((error) => {
      watchedState.errors = error.message;
      watchedState.status = 'invalid';
    })
    .then(() => console.log(state));
});
