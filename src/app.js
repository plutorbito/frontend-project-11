import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';
import i18next from 'i18next';
import resources from './locales/ru.js';
import getDataFromUrl from './getDataFromUrl.js';
import parseDataFromUrl from './parseDataFromUrl.js';

const elements = {
  formEl: document.querySelector('.rss-form'),
  inputEl: document.querySelector('#url-input'),
  feedbackEl: document.querySelector('.feedback'),
  feedsEl: document.querySelector('.feeds'),
  postsEl: document.querySelector('.posts'),
};

const state = {
  status: '',
  feedback: '',
  feeds: [],
  posts: [],
};

const validate = (field, array) => {
  const schema = yup.string().url().required().notOneOf(array);
  return schema.validate(field);
};

const handleErrors = (error, watchedState) => {
  error.message === 'Failed to fetch'
    ? (watchedState.feedback = 'validation.connectionError')
    : (watchedState.feedback = error.message);
  watchedState.status = 'invalid';
};

export default () => {
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
          default: 'validation.default',
          notOneOf: 'validation.notOneOf',
        },
        string: {
          required: 'validation.required',
          url: 'validation.invalidUrl',
        },
      });

      const watchedState = onChange(state, render(elements, i18nextInstance));

      elements.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const urlsArray = watchedState.feeds.map((feed) => feed.url);
        validate(url, urlsArray)
          .then(() => {
            getDataFromUrl(url)
              .then((data) => {
                watchedState.feedback = 'validation.success';
                watchedState.status = 'valid';
                const { feeds, posts } = parseDataFromUrl(data, url);
                watchedState.feeds.push(feeds);
                watchedState.posts.push(...posts);
              })
              .catch((error) => {
                handleErrors(error, watchedState);
              });
          })
          .catch((error) => handleErrors(error, watchedState))
          .then(() => {
            console.log(state);
          });
      });
    });
};
