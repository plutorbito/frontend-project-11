import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import _ from 'lodash';
import view from './view.js';
import resources from './locales/ru.js';
import getDataFromUrl from './getDataFromUrl.js';
import parseDataFromUrl from './parseDataFromUrl.js';

const state = {
  form: {
    status: '',
    feedback: '',
  },
  data: {
    feeds: [],
    posts: [],
    viewedPostIds: [],
  },
  ui: {
    modalPostId: null,
  },
};

const validate = (field, array) => {
  const schema = yup.string().url().required().notOneOf(array);
  return schema.validate(field);
};

const setInvalidStatus = (watchedState) => {
  watchedState.form.status = 'invalid';
};

const handleErrors = (error, watchedState) => {
  return watchedState.feedback = error.name === 'AxiosError' 
    ? 'validation.connectionError' 
    : error.message;
};

const setFeedId = (feed, feedId) => {
  feed.feedId = feedId;
  return feed;
};

const setPostsIds = (posts, feedId) => posts.map((post) => ({
  ...post,
  feedId,
  postId: _.uniqueId(),
}));

export default () => {
  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputEl: document.querySelector('#url-input'),
    feedbackEl: document.querySelector('.feedback'),
    feedsEl: document.querySelector('.feeds'),
    postsEl: document.querySelector('.posts'),
    modalEl: document.getElementById('modal'),
  };

  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({ lng: defaultLanguage, debug: false, resources }).then(() => {
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

    const watchedState = onChange(state, view(elements, i18nextInstance, state));

    const checkForNewPosts = () => {
      const timeOutInterval = 5000;
      const promises = watchedState.data.feeds.map((feed) => getDataFromUrl(feed.url)
        .then((data) => {
          const { posts: currentPosts } = parseDataFromUrl(data, feed.url);
          const newPosts = currentPosts.filter((post) => !watchedState.data.posts.some(
            (existingPost) => existingPost.postLink === post.postLink,
          ));
          if (newPosts.length > 0) {
            const newPostsWithIds = setPostsIds(newPosts, feed.feedId);
            watchedState.data.posts.push(...newPostsWithIds);
          }
        })
        .catch((error) => console.log(error.message)));
      Promise.all(promises).then(() => setTimeout(checkForNewPosts, timeOutInterval));
    };

    checkForNewPosts();

    elements.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const urlsArray = watchedState.data.feeds.map((feed) => feed.url);
      validate(url, urlsArray)
        .then(() => {
          watchedState.form.status = 'valid';
          getDataFromUrl(url)
            .then((data) => {
              watchedState.form.feedback = 'validation.success';
              watchedState.form.status = 'uploaded';

              const { feed, posts } = parseDataFromUrl(data, url);
              const feedId = _.uniqueId();
              const feedWithId = setFeedId(feed, feedId);
              const postsWithIds = setPostsIds(posts, feedId);

              watchedState.data.feeds.push(feedWithId);
              watchedState.data.posts.push(...postsWithIds);
            })
            .catch((error) => {
              handleErrors(error, watchedState);
              watchedState.form.status = 'invalid';
            });
        })
        .catch((error) => {
          handleErrors(error, watchedState);
          watchedState.form.status = 'invalid';
        });
    });

    elements.modalEl.addEventListener('show.bs.modal', (e) => {
      const postId = e.relatedTarget.dataset.id;
      watchedState.ui.modalPostId = postId;
      watchedState.data.viewedPostIds.push(postId);
    });
  });
};
