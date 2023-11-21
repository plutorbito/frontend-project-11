import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

export default () => {
  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputEl: document.querySelector('#url-input'),
  };

  const state = {
    status: '',
    errors: '',
    urls: [],
  };

  const validate = (field, array) => {
    const schema = yup.string().url().required().notOneOf(array);
    return schema.validate(field);
  };

  const watchedState = onChange(state, render(elements));

  elements.formEl.addEventListener('submit', (e) => {
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
};
