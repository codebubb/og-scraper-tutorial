const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const xpath = require('xpath');
const { DOMParser } = require('xmldom');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/scrape', (req, res) => {
  const { body } = req;
  const { url } = body;

  return parseUrl(url)
    .then((result) => res.json(result));
});

app.listen(3000, () => console.log('OG Scraper listening...'))

const wordsPerMinute = 250;

const xpaths = {
  title: 'string(//meta[@property="og:title"]/@content)',
  description: 'string(//meta[@property="og:description"]/@content)',
  image: 'string(//meta[@property="og:image"]/@content)',
  keywords: 'string(//meta[@property="keywords"]/@content)',
};

const retrievePage = (url) => axios.request({ url });
const convertBodyToDocument = (body) => new DOMParser().parseFromString(body);
const nodesFromDocument = (document, xpathSelector) => xpath.select(xpathSelector, document);
const extractLength = (document) => {
  const text = xpath.evaluate('//p', document, null, xpath.XPathResult.ANY_TYPE, null);
  let length = 0;
  let node = text.iterateNext();

  while (node) {
    length += node.toString().split(' ').length;
    node = text.iterateNext();
  }

  return length / wordsPerMinute;
}
// eslint-disable-next-line
const parseUrl = (url) => retrievePage(url)
  .then((response) => {
    const document = convertBodyToDocument(response.data);
    const length = extractLength(document);

    return {
      ...Object.keys(xpaths).reduce((acc, key) => ({ ...acc, [key]: nodesFromDocument(document, xpaths[key]) }), {}),
      length,
    };
  })
  .then((result) => {
    const urlObj = new URL(url);

    return Object.assign(result, { url, source: urlObj.origin, type: 'article', price: 0, added: new Date().toISOString()});
  });