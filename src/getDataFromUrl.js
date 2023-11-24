export default (url) => {
  return fetch(
    `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
      url
    )}`
  ).then((response) => {
    if (response.ok) return response.text();
    throw new Error('Network response was not ok.');
  });
};
