const parseFeedData = (channel, url) => {
  const feedTitle = channel.querySelector('title');
  const feedDescription = channel.querySelector('description');

  return {
    title: feedTitle.textContent,
    description: feedDescription.textContent,
    url,
  };
};

const parsePostData = (item) => {
  const itemTitle = item.querySelector('title');
  const itemDescription = item.querySelector('description');
  const itemLink = item.querySelector('link');

  return {
    title: itemTitle.textContent,
    description: itemDescription.textContent,
    link: itemLink.textContent,
  };
};

const rssParser = (dataContent, url) => {
  try {
    const parser = new DOMParser();
    const parsedContent = parser.parseFromString(dataContent, 'application/xml');
    const channel = parsedContent.querySelector('channel');
    const items = channel.querySelectorAll('item');
    const feed = parseFeedData(channel, url);
    const posts = [];
    items.forEach((item) => posts.unshift(parsePostData(item)));

    return { feed, posts };
  } catch {
    const customError = new Error('notValidRSS');
    customError.name = 'CustomError';
    throw customError;
  }
};

export default rssParser;
