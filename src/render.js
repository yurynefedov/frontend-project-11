const renderValidationResult = (elements, watchedState, validationState, i18next) => {
  const validationScenarios = {
    true: () => {
      elements.inputField.classList.remove('is-invalid');
      elements.inputFeedback.classList.remove('text-danger');
      elements.inputField.classList.add('is-valid');
      elements.inputFeedback.classList.add('text-success');
      elements.inputFeedback.textContent = i18next.t('inputFeedback.success');
      elements.inputForm.reset();
      elements.inputField.focus();
    },
    false: () => {
      elements.inputField.classList.add('is-invalid');
      elements.inputFeedback.classList.remove('text-success');
      elements.inputFeedback.classList.add('text-danger');
      elements.inputFeedback.textContent = watchedState.inputFeedback;
    },
  };

  validationScenarios[validationState]();
};

const renderInputFeedback = (elements, value) => {
  elements.inputFeedback.textContent = value;
};

export default (path, elements, watchedState, value, i18next) => {
  switch (path) {
    case 'inputFormValidation.valid': renderValidationResult(elements, watchedState, value, i18next);
      break;
    case 'inputFeedback': renderInputFeedback(elements, value);
      break;
    case 'feeds':
    case 'posts':
    case 'inputFormValidation.state':
      return;
    default:
      throw new Error(`Unknown change of state: ${path}`);
  }
};
