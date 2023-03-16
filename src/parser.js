const rssParser = (dataContent) => {
  const parser = new DOMParser();
  return parser.parseFromString(dataContent, 'application/xml');
};

export default rssParser;
