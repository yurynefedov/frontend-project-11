export default {
  translation: {
    mainHeader: 'RSS-агрегатор',
    description: 'Начните читать RSS сегодня! Это легко, это красиво.',
    feeds: 'Фиды',
    posts: 'Посты',
    postViewButton: 'Просмотр',

    inputForm: {
      label: 'Ссылка RSS',
      button: 'Добавить',
      example: 'Пример: https://ru.hexlet.io/lessons.rss',
    },

    inputFeedback: {
      errors: {
        notValidUrl: 'Ссылка должна быть валидным URL',
        isEmpty: 'Не должно быть пустым',
        alreadyExist: 'RSS уже существует',
        notValidRSS: 'Ресурс не содержит валидный RSS',
        networkError: 'Ошибка сети',
        unknownError: 'Что-то пошло не так',
      },
      success: 'RSS успешно загружен',
    },

    modalWindow: {
      readArticleButton: 'Читать полностью',
      closeButton: 'Закрыть',
    },
  },
};
