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

const generateCard = (path, container, i18next) => {
  container.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18next.t(path);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  cardBody.appendChild(cardTitle);
  card.appendChild(cardBody);
  card.appendChild(ul);
  container.appendChild(card);
};

const appendFeeds = (watchedState) => {
  const ul = document.querySelector('.feeds ul');
  watchedState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const listItemHeading = document.createElement('h3');
    listItemHeading.classList.add('h6', 'm-0');
    listItemHeading.textContent = feed.title;
    const listItemDescription = document.createElement('p');
    listItemDescription.classList.add('m-0', 'small', 'text-black-50');
    listItemDescription.textContent = feed.description;

    li.appendChild(listItemHeading);
    li.appendChild(listItemDescription);
    ul.appendChild(li);
  });
};

const renderFeeds = (path, elements, watchedState, i18next) => {
  generateCard(path, elements.feedsContainer, i18next);
  appendFeeds(watchedState);
};

const appendPosts = (watchedState, i18next) => {
  const ul = document.querySelector('.posts ul');
  watchedState.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.href = post.link;
    link.classList.add('fw-bold');
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18next.t('postViewButton');

    li.appendChild(link);
    li.appendChild(button);
    ul.appendChild(li);
  });
};

const renderPosts = (path, elements, watchedState, i18next) => {
  generateCard(path, elements.postsContainer, i18next);
  appendPosts(watchedState, i18next);
};

export default (path, elements, watchedState, value, i18next) => {
  switch (path) {
    case 'inputFormValidation.valid': renderValidationResult(elements, watchedState, value, i18next);
      break;
    case 'inputFeedback': renderInputFeedback(elements, value);
      break;
    case 'feeds': renderFeeds(path, elements, watchedState, i18next);
      break;
    case 'posts': renderPosts(path, elements, watchedState, i18next);
      break;
    case 'inputFormValidation.state':
      return;
    default:
      throw new Error(`Unknown change of state: ${path}`);
  }
};
