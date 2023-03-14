export default (elements, i18next) => {
  elements.mainHeader.textContent = i18next.t('mainHeader');
  elements.inputLabel.textContent = i18next.t('inputForm.label');
  elements.submitButton.textContent = i18next.t('inputForm.button');
  elements.inputExample.textContent = i18next.t('inputForm.example');
  elements.modalWindowArticleLink.textContent = i18next.t('modalWindow.readArticleButton');
  elements.modalWindowCloseButton.textContent = i18next.t('modalWindow.closeButton');
};
