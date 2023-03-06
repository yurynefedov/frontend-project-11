import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './render.js';
import resources from './locales/index.js';
import RSSparser from './parser.js';

const i18nInstance = i18next.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: true,
  resources,
});

const validateForm = (url, existedFeedsUrls) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(existedFeedsUrls);

  return schema.validate(url, { abortEarly: false });
};

yup.setLocale({
  mixed: {
    notOneOf: i18nInstance.t('inputFeedback.alreadyExist'),
  },
  string: {
    url: i18nInstance.t('inputFeedback.notValidUrl'),
  },
});

const elements = {
  inputForm: document.querySelector('.rss-form'),
  inputField: document.querySelector('#url-input'),
  inputFeedback: document.querySelector('.feedback'),
  submitButton: document.querySelector('button[type="submit"]'),
  postsContainer: document.querySelector('.posts'),
  feedsContainer: document.querySelector('.feeds'),
};

const proxifyUrl = (url) => `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`;

const getFeedsAndPostsData = (content, watchedState, url) => {
  try {
    const channel = content.querySelector('channel');
    const feedTitle = channel.querySelector('title');
    const feedDescription = channel.querySelector('description');

    const feed = {
      title: feedTitle.textContent,
      description: feedDescription.textContent,
      url,
      id: uniqueId(),
    };
    watchedState.feeds.unshift(feed);

    const items = channel.querySelectorAll('item');
    items.forEach((item) => {
      const itemTitle = item.querySelector('title');
      const itemDescription = item.querySelector('description');
      const itemLink = item.querySelector('link');

      const post = {
        title: itemTitle.textContent,
        description: itemDescription.textContent,
        link: itemLink.textContent,
        feedId: feed.id,
        id: uniqueId(),
      };
      watchedState.posts.unshift(post);
    });
  } catch {
    throw new Error(i18nInstance.t('inputFeedback.notValidRSS'));
  }
};

export default () => {
  const state = {
    feeds: [],
    posts: [],
    inputFormValidation: {
      state: 'filing', // filing, proccessing, processed, failed
      valid: null, // true, false
    },
    inputFeedback: '',
  };

  const watchedState = onChange(
    state,
    (path, value) => render(path, elements, state, value, i18nInstance),
  );

  elements.inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url').trim().toLowerCase();
    const existedFeedsUrls = watchedState.feeds.map((feed) => feed.url);
    validateForm(url, existedFeedsUrls)
      .then((validUrl) => {
        watchedState.inputFormValidation.valid = true;
        watchedState.inputFormValidation.state = 'processing';
        return axios.get(proxifyUrl(validUrl));
      })
      .then((response) => {
        const sourceContent = RSSparser(response.data.contents);
        getFeedsAndPostsData(sourceContent, watchedState, url);
      })
      .catch((error) => {
        watchedState.inputFormValidation.valid = false;
        watchedState.inputFeedback = error.message;
      });
  });
};
