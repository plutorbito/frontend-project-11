import _ from 'lodash';

export default (data, url) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');
  const isRssChanel = doc.querySelector('channel');
  if (!isRssChanel) {
    throw new Error('validation.invalidRss');
  }
  const feedTitle = doc.querySelector('title').textContent;

  const feedDescription = doc.querySelector('description').textContent;
  const feedId = _.uniqueId();
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const postLink = item
      .querySelector('link')
      .nextSibling.textContent.split('\\n')[0];
    const postTitle = item.querySelector('title').textContent;
    const postId = _.uniqueId();
    return { postTitle, postLink, feedId: feedId, id: postId };
  });
  return { feeds: { feedTitle, feedDescription, url, feedId }, posts };
};