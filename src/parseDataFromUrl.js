export default (data, url) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  const isParseError = doc.querySelector('parsererror');
  if (isParseError) {
    throw new Error('validation.invalidRss');
  }
  const feedTitle = doc.querySelector('title').textContent;

  const feedDescription = doc.querySelector('description').textContent;
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const postLink = item.querySelector('link').textContent;
    const postTitle = item.querySelector('title').textContent;
    return { postTitle, postLink };
  });
  const feeds = [{ feedTitle, feedDescription, url }];
  return { feeds, posts };
};
