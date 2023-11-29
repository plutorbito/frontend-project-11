import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';
import i18next from 'i18next';
import resources from './locales/ru.js';
import getDataFromUrl from './getDataFromUrl.js';
import parseDataFromUrl from './parseDataFromUrl.js';
import _ from 'lodash';

const elements = {
  formEl: document.querySelector('.rss-form'),
  inputEl: document.querySelector('#url-input'),
  feedbackEl: document.querySelector('.feedback'),
  feedsEl: document.querySelector('.feeds'),
  postsEl: document.querySelector('.posts'),
  modalEl: document.getElementById('modal'),
};

const state = {
  status: '',
  feedback: '',
  feeds: [],
  posts: [],
  modalPostId: null,
  viewedPostIds: [],
};

const validate = (field, array) => {
  const schema = yup.string().url().required().notOneOf(array);
  return schema.validate(field);
};

const handleErrors = (error, watchedState) => {
  error.name === 'AxiosError'
    ? (watchedState.feedback = 'validation.connectionError')
    : (watchedState.feedback = error.message);
  watchedState.status = 'invalid';
};

const getFeedsWithIds = (feeds, feedId) => {
  return feeds.map((feed) => {
    return { ...feed, feedId: feedId };
  });
};

const getPostsWithIds = (posts, feedId) => {
  return posts.map((post) => {
    const postId = _.uniqueId();
    return { ...post, feedId: feedId, postId: postId };
  });
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

      const watchedState = onChange(
        state,
        render(elements, i18nextInstance, state)
      );

      const checkForNewPosts = () => {
        watchedState.feeds.forEach((feed) => {
          getDataFromUrl(feed.url)
            .then((data) => {
              const { posts: newPosts } = parseDataFromUrl(data, feed.url);
              const filteredNewPosts = newPosts.filter((post) => {
                return !watchedState.posts.some(
                  (existingPost) => existingPost.postLink === post.postLink
                );
              });
              if (filteredNewPosts.length > 0) {
                const newPostsWithIds = getPostsWithIds(
                  filteredNewPosts,
                  feed.feedId
                );
                watchedState.posts.push(...newPostsWithIds);
              }
            })
            .catch((error) => handleErrors(error, watchedState));
        });
        setTimeout(checkForNewPosts, 5000);
      };

      checkForNewPosts();

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
                const feedId = _.uniqueId();
                const feedsWithIds = getFeedsWithIds(feeds, feedId);
                const postsWithIds = getPostsWithIds(posts, feedId);

                watchedState.feeds.push(...feedsWithIds);
                watchedState.posts.push(...postsWithIds);
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

      elements.modalEl.addEventListener('show.bs.modal', (e) => {
        const postId = e.relatedTarget.dataset.id;
        watchedState.modalPostId = postId;
        watchedState.viewedPostIds.push(postId);
      });
    });
};
