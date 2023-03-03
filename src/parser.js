export default (dataContent) => {
  const parser = new DOMParser();
  return parser.parseFromString(dataContent, 'application/xml');
};
