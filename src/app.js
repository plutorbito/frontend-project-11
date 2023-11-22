import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';
import i18next from 'i18next';
import resources from './locales/ru.js';

export default () => {
  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputEl: document.querySelector('#url-input'),
    feedbackEl: document.querySelector('.feedback'),
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

  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: defaultLanguage,
      debug: false,
      resources,
    })
    .then(() => {
      yup.setLocale({
        mixed: {
          default: i18nextInstance.t('validation.default'),
          notOneOf: i18nextInstance.t('validation.notOneOf'),
        },
        string: {
          required: i18nextInstance.t('validation.required'),
          url: i18nextInstance.t('validation.url'),
        },
      });

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
    });
};
