import * as yup from 'yup';
import onChange from 'on-change';

const validateForm = (url, feeds) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(feeds, 'RSS уже существует');

  return schema.validate(url, { abortEarly: false });
};

const renderValidationResult = (elements, state, validationState) => {
  const scenarios = {
    true: () => {
      elements.inputField.classList.remove('is-invalid');
      elements.inputFeedback.classList.remove('text-danger');
      elements.inputField.classList.add('is-valid');
      elements.inputFeedback.classList.add('text-success');
      elements.inputFeedback.textContent = 'Валидация пройдена';
      elements.inputForm.reset();
      elements.inputField.focus();
    },
    false: () => {
      elements.inputField.classList.add('is-invalid');
      elements.inputFeedback.classList.remove('text-success');
      elements.inputFeedback.classList.add('text-danger');
      elements.inputFeedback.textContent = state.inputFormValidation.errorMessage;
    },
  };

  scenarios[validationState]();
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

  const watchedState = onChange(state, (path, value) => {
    if (path === 'inputFormValidation.valid') renderValidationResult(elements, state, value);
  });

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
