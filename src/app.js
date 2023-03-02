import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js';

const validateForm = (url, feeds) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(feeds, 'RSS уже существует');

  return schema.validate(url, { abortEarly: false });
};

export default () => {
  const elements = {
    inputForm: document.querySelector('.rss-form'),
    inputField: document.querySelector('#url-input'),
    inputFeedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
  };

  const state = {
    feeds: [],
    inputFormValidation: {
      state: 'filing', // filing, proccessing, processed, failed
      valid: null, // true, false
      errorMessage: '',
    },
  };

  const watchedState = onChange(
    state,
    (path, value) => render(path, elements, state, value),
  );

  elements.inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('сабмит');
    const formData = new FormData(event.target);
    const url = formData.get('url').trim().toLowerCase();
    console.log(url);
    validateForm(url, watchedState.feeds)
      .then((validUrl) => {
        console.log(validUrl);
        watchedState.inputFormValidation.valid = true;
        watchedState.inputFormValidation.state = 'processing';
        watchedState.feeds.push(validUrl);
      })
      .catch((error) => {
        console.log(error);
        watchedState.inputFormValidation.errorMessage = error.message;
        watchedState.inputFormValidation.valid = false;
      });
  });
};
