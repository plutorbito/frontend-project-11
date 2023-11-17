import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';

const formEl = document.querySelector('.rss-form');
const inputEl = document.querySelector('#url-input');

const schema = yup.string().url().required();

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return { error: e.inner[0].message };
  }
};

const state = {
  status: '',
  errors: '',
  urls: [],
};

const render = () => (path, value) => {
  if (path === 'status') {
    if (value === 'invalid') {
      inputEl.classList.add('is-invalid');
    } else if (value === 'valid') {
      inputEl.classList.remove('is-invalid');
      inputEl.focus();
      formEl.reset();
    }
  }
};

const watchedState = onChange(state, render());

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  const validation = validate(url);
  if (!_.isEmpty(validation.error)) {
    watchedState.errors = validation.error;
    watchedState.status = 'invalid';
  } else if (state.urls.includes(url)) {
    watchedState.errors = 'url already exists';
    watchedState.status = 'invalid';
  } else {
    watchedState.errors = '';
    watchedState.urls.push(url);
    watchedState.status = 'valid';
  }
  console.log(state);
});
