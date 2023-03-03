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
    console.log(url); // Для отладки
    const existedFeedsUrls = watchedState.feeds.map((feed) => feed.url);
    validateForm(url, existedFeedsUrls)
      .then((validUrl) => {
        watchedState.inputFormValidation.valid = true;
        watchedState.inputFormValidation.state = 'processing';
        return axios.get(proxifyUrl(validUrl));
      })
      .then((response) => {
        console.log('second then');
        console.log(RSSparser(response.data.contents));
        const sourceContent = RSSparser(response.data.contents);

        // Вынести в отдельную функцию, которая принимает параметром sourceContent
        const channel = sourceContent.querySelector('channel');
        if (!channel) throw new Error(i18nInstance.t('inputFeedback.notValidRSS'));
        const feedTitle = channel.querySelector('title');
        const feedDescription = channel.querySelector('description');

        const feed = {
          title: feedTitle.textContent,
          description: feedDescription.textContent,
          url,
          id: uniqueId(),
        };
        console.log(feed);
        watchedState.feeds.unshift(feed);
        console.log(state.feeds[0]); // Каждый новый фид появляется сверху

        const items = channel.querySelectorAll('item');
        items.forEach((item) => {
          console.log(item);
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
        console.log(state.posts.length); // Количество постов увеличивается с каждым новым запросом
        // ! TO-DO: Написать логику рендеринга и вынести функции в слой view

        //
      })
      .catch((error) => {
        watchedState.inputFormValidation.valid = false;
        watchedState.inputFeedback = error.message;
      });
  });
};
