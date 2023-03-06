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

const listFeeds = (list, watchedState) => {
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

    list.appendChild(li);
  });
};

const renderFeeds = (elements, watchedState, i18next) => {
  const container = elements.feedsContainer;
  container.innerHTML = '';
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');
  const feedsCardBody = document.createElement('div');
  feedsCardBody.classList.add('card-body');
  const feedsCardTitle = document.createElement('h2');
  feedsCardTitle.classList.add('card-title', 'h4');
  feedsCardTitle.textContent = i18next.t('feeds');
  feedsCardBody.appendChild(feedsCardTitle);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  listFeeds(ul, watchedState);

  feedsCard.appendChild(feedsCardBody);
  feedsCard.appendChild(ul);
  container.appendChild(feedsCard);
};

const listPosts = (list, watchedState, i18next) => {
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

    list.appendChild(li);
  });
};

const renderPost = (elements, watchedState, i18next) => {
  const container = elements.postsContainer;
  container.innerHTML = '';

  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');

  const postsCardBody = document.createElement('div');
  postsCardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.innerText = 'Посты';

  postsCard.appendChild(cardTitle);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  listPosts(ul, watchedState, i18next);

  postsCard.appendChild(postsCardBody);
  postsCard.appendChild(ul);

  container.appendChild(postsCard);
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
        // ! TO-DO: вынести функции в слой view
        renderFeeds(elements, watchedState, i18nInstance);
        renderPost(elements, watchedState, i18nInstance);
        //
      })
      .catch((error) => {
        watchedState.inputFormValidation.valid = false;
        watchedState.inputFeedback = error.message;
      });
  });
};
