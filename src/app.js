import * as yup from 'yup';
import { setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './render.js';
import resources from './locales/index.js';

const i18nInstance = i18next.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: true,
  resources,
});

const validateForm = (url, feeds) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(feeds);

  return schema.validate(url, { abortEarly: false });
};

setLocale({
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
};

export default () => {
  const state = {
    feeds: [],
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
    console.log('Я сабмит'); // Для отладки
    const formData = new FormData(event.target);
    const url = formData.get('url').trim().toLowerCase();
    console.log(url); // Для отладки
    validateForm(url, watchedState.feeds)
      .then((validUrl) => {
        console.log(validUrl); // Для отладки
        watchedState.inputFormValidation.valid = true;
        watchedState.inputFormValidation.state = 'processing';
        watchedState.feeds.push(validUrl);
      })
      .catch((error) => {
        console.log(error); // Для отладки
        console.log('Я ошибка'); // Для отладки
        watchedState.inputFormValidation.valid = false;
        watchedState.inputFeedback = error.message;
      });
  });
};
