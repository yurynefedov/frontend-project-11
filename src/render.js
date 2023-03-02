const renderValidationResult = (elements, watchedState, validationState) => {
  const validationScenarios = {
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
      elements.inputFeedback.textContent = watchedState.inputFormValidation.errorMessage;
    },
  };

  validationScenarios[validationState]();
};

export default (path, pageElements, watchedState, value) => {
  switch (path) {
    case 'inputFormValidation.valid': renderValidationResult(pageElements, watchedState, value);
      break;
    case 'feeds':
    case 'inputFormValidation.state':
    case 'inputFormValidation.errorMessage':
      return;
    default:
      throw new Error(`Unknown change of state: ${path} in ${JSON.stringify(watchedState)}`);
  }
};
