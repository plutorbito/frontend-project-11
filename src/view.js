const createCardElements = (container, i18nextInstance, title) => {
  container.innerHTML = '';

  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'border-0');
  container.append(cardEl);

  const cardBodyEl = document.createElement('div');
  cardBodyEl.classList.add('card-body');
  cardEl.append(cardBodyEl);

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t(title);
  cardBodyEl.append(cardTitle);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  cardEl.append(ulEl);
  return ulEl;
};

const createBtn = (id, i18nextInstance) => {
  const btnEl = document.createElement('button');
  btnEl.type = 'button';
  btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btnEl.dataset.id = id;
  btnEl.dataset.bsToggle = 'modal';
  btnEl.dataset.bsTarget = '#modal';
  btnEl.textContent = i18nextInstance.t('rss.viewBtn');
  return btnEl;
};

const renderInputAndFeedbackStyle = (value, elements) => {
  switch (value) {
    case 'uploaded': {
      elements.inputEl.classList.remove('is-invalid');
      elements.feedbackEl.classList.remove('text-danger');
      elements.feedbackEl.classList.add('text-success');

      elements.formEl.reset();
      elements.inputEl.focus();
      break;
    }

    case 'valid': {
      elements.feedbackEl.textContent = '';
      break;
    }

    case 'invalid': {
      elements.inputEl.classList.add('is-invalid');
      elements.feedbackEl.classList.remove('text-success');
      elements.feedbackEl.classList.add('text-danger');
      break;
    }

    default:
      throw new Error('Unknown value!');
  }
};

const renderFeeds = (value, elements, i18nextInstance, cardTitle) => {
  const feedUlEl = createCardElements(
    elements.feedsEl,
    i18nextInstance,
    cardTitle,
  );

  value.forEach((el) => {
    const feedLiEl = document.createElement('li');
    feedLiEl.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedTitleEl = document.createElement('h3');
    feedTitleEl.classList.add('h6', 'm-0');
    feedTitleEl.textContent = el.feedTitle;
    feedLiEl.append(feedTitleEl);

    const feedDescriptionEl = document.createElement('p');
    feedDescriptionEl.classList.add('m-0', 'small', 'text-black-50');
    feedDescriptionEl.textContent = el.feedDescription;
    feedLiEl.append(feedDescriptionEl);

    feedUlEl.append(feedLiEl);
  });
};

const renderNewPosts = (value, elements, i18nextInstance, cardTitle) => {
  const postUlEl = createCardElements(
    elements.postsEl,
    i18nextInstance,
    cardTitle,
  );

  value.forEach((el) => {
    const postLiEl = document.createElement('li');
    postLiEl.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const postAEl = document.createElement('a');
    postAEl.href = el.postLink;
    postAEl.textContent = el.postTitle;
    postAEl.classList.add('fw-bold');
    postAEl.dataset.id = el.postId;
    postAEl.target = '_blank';
    postAEl.rel = 'noopener noreferrer';
    postLiEl.append(postAEl);

    const btnEl = createBtn(el.postId, i18nextInstance);
    postLiEl.append(btnEl);

    postUlEl.append(postLiEl);
  });
};

const renderViewedPosts = (postsIds) => postsIds.forEach((postId) => {
  const viewedPost = document.querySelector(`[data-id='${postId}']`);
  viewedPost.classList.remove('fw-bold');
  viewedPost.classList.add('fw-normal');
});

const renderModalWindow = (value, elements, state) => {
  const modalHeader = elements.modalEl.querySelector('.modal-header');
  const modalBody = elements.modalEl.querySelector('.modal-body');

  const postDataToShow = state.posts.find((post) => post.postId === value);
  const { postTitle, postDescription, postLink } = postDataToShow;

  modalHeader.textContent = postTitle;
  modalBody.textContent = postDescription;

  const viewArticleBtn = elements.modalEl.querySelector('.btn-primary');
  viewArticleBtn.href = postLink;
};

export default (elements, i18nextInstance, state) => (path, value) => {
  const cardTitle = `rss.${path}`;
  switch (path) {
    case 'status':
      renderInputAndFeedbackStyle(value, elements);
      break;

    case 'feedback': {
      elements.feedbackEl.textContent = i18nextInstance.t(value);
      break;
    }

    case 'feeds': {
      renderFeeds(value, elements, i18nextInstance, cardTitle);
      break;
    }

    case 'posts':
      renderNewPosts(value, elements, i18nextInstance, cardTitle);
      renderViewedPosts(state.viewedPostIds);
      break;

    case 'modalPostId':
      renderModalWindow(value, elements, state);
      break;

    case 'viewedPostIds':
      renderViewedPosts(value);
      break;

    default:
      throw new Error('Unknown path!');
  }
};
