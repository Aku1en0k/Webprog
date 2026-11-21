'use strict';

/* ---------- 1. Тёмная тема ---------- */
const THEME_KEY = 'resumebot-theme';
const themeBtn = document.querySelector('#themeToggle');

function applyTheme(isDark) {
  document.body.classList.toggle('dark-theme', isDark);
  // чтобы Bootstrap-компоненты (modal) тоже стали тёмными
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  if (themeBtn) {
    themeBtn.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
    themeBtn.setAttribute('aria-pressed', String(isDark));
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark';
  } catch (e) {
    return false; // localStorage может быть недоступен
  }
}

applyTheme(loadTheme());

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    applyTheme(isDark);
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch (e) {
      /* не страшно, тема просто не запомнится */
    }
  });
}

/* ---------- 2. Активный пункт меню ---------- */
const currentPage = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.menu a').forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

/* ---------- 3. Кнопка «Подробнее» (главная) ---------- */
const showMoreBtn = document.querySelector('#showMore');
const moreText = document.querySelector('#moreText');

if (showMoreBtn && moreText) {
  showMoreBtn.addEventListener('click', () => {
    moreText.classList.toggle('d-none');
    const isHidden = moreText.classList.contains('d-none');
    showMoreBtn.textContent = isHidden ? 'Подробнее' : 'Скрыть';
    showMoreBtn.setAttribute('aria-expanded', String(!isHidden));
  });
}

/* ---------- 4. Форма обратной связи (контакты) ---------- */
const contactForm = document.querySelector('#contactForm');

if (contactForm) {
  const nameField = contactForm.querySelector('#name');
  const emailField = contactForm.querySelector('#email');
  const messageField = contactForm.querySelector('#message');
  const formMessage = document.querySelector('#formMessage');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showFormMessage(text, isError) {
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + (isError ? 'text-danger' : 'text-success');
  }

  function markInvalid(field, isInvalid) {
    field.classList.toggle('invalid', isInvalid);
    field.setAttribute('aria-invalid', String(isInvalid));
  }

  // как только человек начал исправлять поле, убираем подсветку
  [nameField, emailField, messageField].forEach((field) => {
    field.addEventListener('input', () => markInvalid(field, false));
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault(); // не перезагружаем страницу

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();

    markInvalid(nameField, !name);
    markInvalid(emailField, !EMAIL_RE.test(email));
    markInvalid(messageField, !message);

    if (!name || !EMAIL_RE.test(email) || !message) {
      const firstBad = contactForm.querySelector('.invalid');
      showFormMessage(
        !EMAIL_RE.test(email) && email && name && message
          ? 'Проверьте email: он должен выглядеть как name@example.com'
          : 'Заполните все поля и проверьте email',
        true
      );
      if (firstBad) firstBad.focus();
      return;
    }

    // textContent, а не innerHTML: имя вводит пользователь
    showFormMessage('Спасибо, ' + name + '! Сообщение принято.', false);
    contactForm.reset();
  });
}

/* ---------- 5. Технологии из JSON (о проекте) ---------- */
const stackBox = document.querySelector('#stack');

// запасные данные: если fetch не сработал (например, открыто через file://)
const FALLBACK_STACK = [
  { title: 'Python', description: 'Язык, на котором написан бот' },
  { title: 'Aiogram 3', description: 'Фреймворк для работы с Telegram Bot API' },
  { title: 'PostgreSQL', description: 'База данных' },
  { title: 'OpenAI API', description: 'Языковая модель: анализ вакансии и адаптация резюме' },
];

function renderStack(items) {
  const list = document.createElement('ul');
  list.className = 'stack-list';

  items.forEach((item) => {
    const li = document.createElement('li');
    const title = document.createElement('b');
    title.textContent = item.title;
    li.append(title, document.createElement('br'), item.description);
    list.append(li);
  });

  stackBox.replaceChildren(list);
}

if (stackBox) {
  fetch('./data/stack.json')
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(renderStack)
    .catch(() => renderStack(FALLBACK_STACK));
}
