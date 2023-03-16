import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './render.js';
import resources from './locales/index.js';
import rssParser from './parser.js';
import staticTextsSetter from './static-texts-setter.js';

const validateForm = (url, existedFeedsUrls) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(existedFeedsUrls);

  return schema.validate(url, { abortEarly: false });
};

const proxifyUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const getFeed = (channel, url) => {
  const feedTitle = channel.querySelector('title');
  const feedDescription = channel.querySelector('description');

  return {
    title: feedTitle.textContent,
    description: feedDescription.textContent,
    url,
    id: uniqueId(),
  };
};

const getPost = (item, feed) => {
  const itemTitle = item.querySelector('title');
  const itemDescription = item.querySelector('description');
  const itemLink = item.querySelector('link');

  return {
    title: itemTitle.textContent,
    description: itemDescription.textContent,
    link: itemLink.textContent,
    feedId: feed.id,
    id: uniqueId(),
  };
};

const getFeedAndRelatedPosts = (parsedContent, watchedState, url) => {
  try {
    const channel = parsedContent.querySelector('channel');
    const feed = getFeed(channel, url);
    watchedState.feeds.unshift(feed);

    const items = channel.querySelectorAll('item');
    items.forEach((item) => {
      const post = getPost(item, feed);
      watchedState.posts.unshift(post);
    });
  } catch {
    const customError = new Error('notValidRSS');
    customError.name = 'CustomError';
    throw customError;
  }
};

const contentAutoupdateTimer = 5000; // ms

const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => axios.get(proxifyUrl(feed.url))
    .then((response) => {
      const parsedContent = rssParser(response.data.contents);
      const channel = parsedContent.querySelector('channel');
      const items = channel.querySelectorAll('item');

      const loadedPosts = [];
      items.forEach((item) => {
        const post = getPost(item, feed);
        loadedPosts.unshift(post);
      });

      const existedPostsUrls = watchedState.posts
        .filter((post) => post.feedId === feed.id)
        .map((post) => post.link);
      const newPosts = loadedPosts.filter((post) => !existedPostsUrls.includes(post.link));

      newPosts.forEach((post) => watchedState.posts.unshift(post));
    })
    .catch((error) => {
      throw error;
    }));

  return Promise.all(promises)
    .catch((error) => {
      console.error(`${error.name}: ${error.message}`);
    })
    .finally(() => setTimeout(updatePosts, contentAutoupdateTimer, watchedState));
};

const errorHandler = (error, watchedState) => {
  watchedState.error = '';
  watchedState.inputForm.state = 'failed';
  switch (error.name) {
    case 'ValidationError':
      watchedState.inputForm.valid = false;
      watchedState.error = error.message;
      break;
    case 'CustomError':
      watchedState.error = error.message;
      break;
    case 'AxiosError':
      watchedState.error = 'networkError';
      break;
    default:
      watchedState.error = 'unknownError';
      console.error(`${error.name}: ${error.message}`);
  }
};

const app = () => {
  const state = {
    feeds: [],
    posts: [],
    error: '',
    inputForm: {
      state: 'filing', // filing, processing, processed, failed
      valid: null, // true, false
    },
    UIState: {
      viewedPostsIds: new Set(),
      activePost: null,
    },
  };

  const elements = {
    mainHeader: document.querySelector('h1'),
    description: document.querySelector('.lead'),
    inputForm: document.querySelector('.rss-form'),
    inputField: document.querySelector('#url-input'),
    inputLabel: document.querySelector('label[for="url-input"]'),
    inputExample: document.querySelector('#url-example'),
    inputFeedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modalWindowTitle: document.querySelector('.modal-title'),
    modalWindowDescription: document.querySelector('.modal-body'),
    modalWindowArticleLink: document.querySelector('.full-article'),
    modalWindowCloseButton: document.querySelector('.modal-footer button'),
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: 'alreadyExist',
    },
    string: {
      required: 'isEmpty',
      url: 'notValidUrl',
    },
  });

  const watchedState = onChange(
    state,
    (path, value) => render(path, elements, state, value, i18nInstance),
  );

  staticTextsSetter(elements, i18nInstance);

  elements.inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url').trim().toLowerCase();
    const existedFeedsUrls = watchedState.feeds.map((feed) => feed.url);
    validateForm(url, existedFeedsUrls)
      .then((validUrl) => {
        watchedState.inputForm.valid = true;
        watchedState.inputForm.state = 'processing';
        return axios.get(proxifyUrl(validUrl));
      })
      .then((response) => {
        const sourceContent = rssParser(response.data.contents);
        getFeedAndRelatedPosts(sourceContent, watchedState, url);
        watchedState.inputForm.state = 'processed';
      })
      .catch((error) => {
        errorHandler(error, watchedState);
      });
  });

  elements.postsContainer.addEventListener('click', (event) => {
    const activePost = watchedState.posts.find((post) => post.id === event.target.dataset.id);
    watchedState.UIState.activePost = activePost;
    watchedState.UIState.viewedPostsIds.add(activePost.id);
  });

  updatePosts(watchedState);
};

export default app;
