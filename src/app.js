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

const setInvalidStatus = (watchedState) => (watchedState.status = 'invalid');

const handleErrors = (error, watchedState) => {
  const feedback = error.name === 'AxiosError'
    ? (watchedState.feedback = 'validation.connectionError')
    : (watchedState.feedback = error.message);
  return feedback;
};

const setFeedsIds = (feeds, feedId) => feeds.map((feed) => ({ ...feed, feedId }));

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
      watchedState.feeds.forEach((feed) => {
        getDataFromUrl(feed.url)
          .then((data) => {
            const { posts: newPosts } = parseDataFromUrl(data, feed.url);
            const filteredNewPosts = newPosts.filter(
              (post) => !watchedState.posts.some(
                (existingPost) => existingPost.postLink === post.postLink,
              ),
            );
            if (filteredNewPosts.length > 0) {
              const newPostsWithIds = setPostsIds(filteredNewPosts, feed.feedId);
              watchedState.posts.push(...newPostsWithIds);
            }
          })
          .catch((error) => {
            handleErrors(error, watchedState)
          });
      });
      setTimeout(checkForNewPosts, 5000);
    };

    checkForNewPosts();

    elements.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const urlsArray = watchedState.feeds.map((feed) => feed.url);
      watchedState.feedback = '';
      validate(url, urlsArray)
        .then(() => {
          watchedState.status = 'valid';

          getDataFromUrl(url)
            .then((data) => {
              watchedState.feedback = 'validation.success';

              const { feeds, posts } = parseDataFromUrl(data, url);
              const feedId = _.uniqueId();
              const feedsWithIds = setFeedsIds(feeds, feedId);
              const postsWithIds = setPostsIds(posts, feedId);

              watchedState.feeds.push(...feedsWithIds);
              watchedState.posts.push(...postsWithIds);
            })
            .catch((error) => {
              setInvalidStatus(watchedState)
              handleErrors(error, watchedState);
            });
        })
        .catch((error) => {
          setInvalidStatus(watchedState)
          handleErrors(error, watchedState);
        });
    });

    elements.modalEl.addEventListener('show.bs.modal', (e) => {
      const postId = e.relatedTarget.dataset.id;
      watchedState.modalPostId = postId;
      watchedState.viewedPostIds.push(postId);
    });
  });
};
