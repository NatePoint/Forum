const firebaseConfig = {
  // ВСТАВЬ СЮДА СВОЙ КОНФИГ FIREBASE
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const fb = { app: null, db: null, ready: false };

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  fb.app = firebase.app();
  fb.db = firebase.firestore();
  fb.ready = true;
} catch (e) {
  fb.ready = false;
}

const UI_TEXTS = {
  ru: {
    "app.name": "ЗнаниеОбмен",
    "app.tagline": "Форум обмена знаниями",
    "nav.topics": "Все темы",
    "nav.create": "Создать тему",
    "nav.rules": "Правила",
    "nav.settings": "Настройки",
    "sidebar.stats.title": "Статистика",
    "sidebar.stats.topics": "Всего тем:",
    "sidebar.stats.answers": "Всего ответов:",
    "sidebar.stats.solved": "Решённых:",
    "sidebar.stats.authors": "Авторов:",
    "sidebar.tags.title": "Популярные теги",
    "sidebar.tags.empty": "Тегов пока нет",
    "sidebar.about.title": "О форуме",
    "sidebar.about.text": "ЗнаниеОбмен — анти-reddit. Здесь нет голосов и кармы. Ценен только один ответ — тот, который автор темы признал лучшим. Все данные общие и видны каждому.",
    "how.title": "Как это работает",
    "how.text": "Здесь нет голосования. Когда автор темы получит подходящий ответ, он нажмёт кнопку «Лучший ответ» под ним — и тема будет считаться решённой.",
    "topic.stat.title": "Статистика темы",
    "topic.stat.answers": "Ответов:",
    "topic.stat.solved": "Решение найдено:",
    "index.h1": "Все темы",
    "index.btn.create": "Создать тему",
    "index.loading": "Загрузка тем...",
    "index.empty": "Тем пока нет. Создайте первую тему кнопкой выше или в меню слева.",
    "index.total": "Всего тем:",
    "rules.h1": "Правила форума",
    "rules.subtitle": "Коротко: спрашивайте конкретно, отвечайте по делу, признавайте лучший ответ.",
    "settings.h1": "Настройки",
    "settings.theme.label": "Тема оформления",
    "settings.theme.light": "Белая",
    "settings.theme.gray": "Серая",
    "settings.theme.dark": "Тёмная",
    "settings.lang.label": "Язык интерфейса",
    "settings.back": "Ко всем темам",
    "modal.new": "Новая тема",
    "modal.title": "Заголовок",
    "modal.ph.title": "Как бесплатно хранить JSON-файлы больше 5 МБ?",
    "modal.text": "Текст вопроса",
    "modal.ph.text": "Опишите проблему подробно: что пробовали, что получилось, что нет.",
    "modal.author": "Ваше имя",
    "modal.ph.author": "Имя или ник",
    "modal.tags": "Теги (через запятую, до 5)",
    "modal.ph.tags": "firebase, хранилище, json",
    "modal.cancel": "Отмена",
    "modal.submit": "Опубликовать",
    "err.fill": "Заполните заголовок, текст и имя автора.",
    "err.nofb": "Firebase не настроен — создание темы невозможно.",
    "err.save": "Ошибка сохранения: ",
    "err.load": "Ошибка загрузки данных из Firestore: ",
    "err.fbsetup": "Firebase не настроен. Вставьте конфиг в начало файла ui.js.",
    "card.author": "Автор:",
    "card.answers": "Ответов:",
    "card.best": "Лучший ответ",
    "page.prev": "Назад",
    "page.next": "Вперёд",
    "crumb.topics": "Все темы",
    "crumb.topic": "Страница темы",
    "topic.noId": "Тема не найдена: в адресе отсутствует параметр id.",
    "topic.deleted": "Такой темы не существует или она была удалена.",
    "topic.errload": "Ошибка загрузки темы: ",
    "answers.h2": "Ответы",
    "answers.loading": "Загрузка ответов...",
    "answers.empty": "Ответов пока нет. Будьте первым — помогите автору темы.",
    "answers.errload": "Ошибка загрузки ответов: ",
    "answer.mark": "Лучший ответ",
    "answer.unmark": "Снять отметку",
    "answer.by": "Ответил:",
    "reply.h3": "Добавить ответ",
    "reply.author": "Ваше имя",
    "reply.ph.author": "Имя или ник",
    "reply.text": "Текст ответа",
    "reply.ph.text": "Ответьте по существу: решите проблему автора, а не спорьте с ним.",
    "reply.submit": "Отправить ответ",
    "reply.errfill": "Заполните текст ответа и ваше имя.",
    "reply.errnofb": "Firebase не настроен — отправка невозможна.",
    "reply.errsave": "Ошибка сохранения ответа: ",
    "mark.prompt": "Для отметки лучшего ответа введите имя автора темы:",
    "unmark.prompt": "Для снятия отметки введите имя автора темы:",
    "mark.errauthor": "Отметить лучший ответ может только автор темы.",
    "unmark.errauthor": "Снять отметку может только автор темы.",
    "mark.errsave": "Не удалось отметить ответ: ",
    "unmark.errsave": "Не удалось снять отметку: ",
    "back.topics": "Ко всем темам",
    "yes": "Да",
    "no": "Нет"
  },
  en: {
    "app.name": "KnowledgeExchange",
    "app.tagline": "A knowledge exchange forum",
    "nav.topics": "All topics",
    "nav.create": "New topic",
    "nav.rules": "Rules",
    "nav.settings": "Settings",
    "sidebar.stats.title": "Statistics",
    "sidebar.stats.topics": "Topics:",
    "sidebar.stats.answers": "Answers:",
    "sidebar.stats.solved": "Solved:",
    "sidebar.stats.authors": "Authors:",
    "sidebar.tags.title": "Popular tags",
    "sidebar.tags.empty": "No tags yet",
    "sidebar.about.title": "About",
    "sidebar.about.text": "KnowledgeExchange is an anti-reddit. No votes, no karma. Only one answer matters — the one the topic author accepted as best. All data is shared and visible to everyone.",
    "how.title": "How it works",
    "how.text": "There is no voting here. When the author gets a suitable answer, they press the Best answer button under it — and the topic counts as solved.",
    "topic.stat.title": "Topic statistics",
    "topic.stat.answers": "Answers:",
    "topic.stat.solved": "Solution found:",
    "index.h1": "All topics",
    "index.btn.create": "New topic",
    "index.loading": "Loading topics...",
    "index.empty": "No topics yet. Create the first one with the button above or in the left menu.",
    "index.total": "Total topics:",
    "rules.h1": "Forum rules",
    "rules.subtitle": "In short: ask specifically, answer on point, acknowledge the best answer.",
    "settings.h1": "Settings",
    "settings.theme.label": "Color theme",
    "settings.theme.light": "Light",
    "settings.theme.gray": "Gray",
    "settings.theme.dark": "Dark",
    "settings.lang.label": "Interface language",
    "settings.back": "Back to topics",
    "modal.new": "New topic",
    "modal.title": "Title",
    "modal.ph.title": "How to store JSON files over 5 MB for free?",
    "modal.text": "Question text",
    "modal.ph.text": "Describe the problem in detail: what you tried, what worked, what did not.",
    "modal.author": "Your name",
    "modal.ph.author": "Name or nickname",
    "modal.tags": "Tags (comma separated, up to 5)",
    "modal.ph.tags": "firebase, storage, json",
    "modal.cancel": "Cancel",
    "modal.submit": "Publish",
    "err.fill": "Fill in the title, text and author name.",
    "err.nofb": "Firebase is not configured — creating a topic is impossible.",
    "err.save": "Save error: ",
    "err.load": "Error loading data from Firestore: ",
    "err.fbsetup": "Firebase is not configured. Paste your config at the top of ui.js.",
    "card.author": "Author:",
    "card.answers": "Answers:",
    "card.best": "Best answer",
    "page.prev": "Previous",
    "page.next": "Next",
    "crumb.topics": "All topics",
    "crumb.topic": "Topic page",
    "topic.noId": "Topic not found: the id parameter is missing in the URL.",
    "topic.deleted": "This topic does not exist or was deleted.",
    "topic.errload": "Error loading topic: ",
    "answers.h2": "Answers",
    "answers.loading": "Loading answers...",
    "answers.empty": "No answers yet. Be the first — help the topic author.",
    "answers.errload": "Error loading answers: ",
    "answer.mark": "Best answer",
    "answer.unmark": "Remove mark",
    "answer.by": "Answered by:",
    "reply.h3": "Add an answer",
    "reply.author": "Your name",
    "reply.ph.author": "Name or nickname",
    "reply.text": "Answer text",
    "reply.ph.text": "Answer on point: solve the author's problem, do not argue with them.",
    "reply.submit": "Submit answer",
    "reply.errfill": "Fill in the answer text and your name.",
    "reply.errnofb": "Firebase is not configured — submitting is impossible.",
    "reply.errsave": "Error saving answer: ",
    "mark.prompt": "To mark the best answer, enter the topic author's name:",
    "unmark.prompt": "To remove the mark, enter the topic author's name:",
    "mark.errauthor": "Only the topic author can mark the best answer.",
    "unmark.errauthor": "Only the topic author can remove the mark.",
    "mark.errsave": "Failed to mark the answer: ",
    "unmark.errsave": "Failed to remove the mark: ",
    "back.topics": "Back to topics",
    "yes": "Yes",
    "no": "No"
  }
};

const RULES_RU = [
  "Задавайте один конкретный вопрос в одной теме. Так проще найти ответ в будущем.",
  "Отвечайте по существу. Ответ должен решать проблему, а не спорить с автором.",
  "Автор темы обязан отметить лучший ответ кнопкой под подходящим ответом.",
  "На форуме нет лайков и рейтингов. Порядок тем — только по дате создания.",
  "Уважайте других участников. Оскорбления и спам удаляются без предупреждения.",
  "Проверяйте, нет ли уже темы с таким вопросом. Дубликаты размывают базу знаний.",
  "Если решение найдено, вернитесь и отметьте лучший ответ — этим помогаете следующим."
];

const RULES_EN = [
  "Ask one specific question per topic. It is easier to find the answer later.",
  "Answer on point. The answer must solve the problem, not argue with the author.",
  "The topic author must mark the best answer with the button under it.",
  "There are no likes or ratings here. Topics are ordered only by creation date.",
  "Respect other participants. Insults and spam are removed without warning.",
  "Check whether the question was already asked. Duplicates blur the knowledge base.",
  "If a solution is found, come back and mark the best answer — it helps the next people."
];

const DATE_LOCALES = { ru: "ru-RU", en: "en-GB" };

const state = {
  lang: localStorage.getItem("kf-lang") || "ru",
  theme: localStorage.getItem("kf-theme") || "light",
  collapsed: localStorage.getItem("kf-collapsed") === "1"
};

if (!UI_TEXTS[state.lang]) state.lang = "ru";
if (["light", "gray", "dark"].indexOf(state.theme) === -1) state.theme = "light";

function t(key) {
  const dict = UI_TEXTS[state.lang] || UI_TEXTS.ru;
  return dict[key] !== undefined ? dict[key] : (UI_TEXTS.ru[key] !== undefined ? UI_TEXTS.ru[key] : key);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function applyCollapsed() {
  document.body.classList.toggle("nav-collapsed", state.collapsed);
  const btn = document.getElementById("btn-collapse");
  if (btn) {
    btn.setAttribute("aria-expanded", String(!state.collapsed));
    btn.title = state.collapsed ? "+" : "-";
  }
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  const suffix = document.body.dataset.page === "topic" ? " — " + t("app.name") : "";
  document.title = (document.body.dataset.baseTitle || document.title.replace(/ — .*$/, "")) + suffix;
}

function refreshStatic() {
  applyTheme();
  applyI18n();
  renderRulesList();
  renderSettingsPanel();
  applyCollapsed();
}

function setLang(lang) {
  if (!UI_TEXTS[lang]) return;
  state.lang = lang;
  localStorage.setItem("kf-lang", lang);
  refreshStatic();
  document.dispatchEvent(new CustomEvent("kf:refresh"));
}

function setTheme(theme) {
  if (["light", "gray", "dark"].indexOf(theme) === -1) return;
  state.theme = theme;
  localStorage.setItem("kf-theme", theme);
  applyTheme();
  renderSettingsPanel();
}

function toggleSidebar() {
  state.collapsed = !state.collapsed;
  localStorage.setItem("kf-collapsed", state.collapsed ? "1" : "0");
  applyCollapsed();
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const loc = DATE_LOCALES[state.lang] || "ru-RU";
  return d.toLocaleDateString(loc) + " " +
    d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRulesList() {
  const listEl = document.getElementById("rules-list");
  if (!listEl) return;
  const rules = state.lang === "en" ? RULES_EN : RULES_RU;
  listEl.innerHTML = rules
    .map((rule, i) => '<li><span class="rule-num">' + (i + 1) + ".</span><span>" + escapeHtml(rule) + "</span></li>")
    .join("");
}

function renderSettingsPanel() {
  const panel = document.getElementById("view-settings");
  if (!panel) return;
  const themes = ["light", "gray", "dark"];
  const langs = ["ru", "en"];
  panel.querySelector("#theme-buttons").innerHTML = themes
    .map((th) => '<button type="button" class="chip' + (th === state.theme ? " active" : "") + '" data-theme="' + th + '">' +
      t("settings.theme." + th) + "</button>")
    .join("");
  panel.querySelector("#lang-buttons").innerHTML = langs
    .map((lg) => '<button type="button" class="chip' + (lg === state.lang ? " active" : "") + '" data-lang="' + lg + '">' +
      (lg === "ru" ? "Русский" : "English") + "</button>")
    .join("");
  panel.querySelectorAll("button[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });
  panel.querySelectorAll("button[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
}

function switchView(view) {
  const views = document.querySelectorAll(".content > section[id^='view-']");
  views.forEach((sec) => {
    sec.style.display = sec.id === "view-" + view ? "block" : "none";
  });
  document.querySelectorAll(".nav a[data-view], .nav-rail a[data-view]").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
  window.scrollTo(0, 0);
}

function initChrome() {
  document.body.dataset.baseTitle = document.title;

  const collapseBtn = document.getElementById("btn-collapse");
  if (collapseBtn) {
    collapseBtn.addEventListener("click", toggleSidebar);
  }

  document.querySelectorAll(".nav a[data-view], .nav-rail a[data-view]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
      history.replaceState(null, "", window.location.pathname + window.location.search + "#" + link.dataset.view);
    });
  });

  const createMenuLink = document.getElementById("btn-open-create-menu");
  if (createMenuLink) {
    createMenuLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent("kf:open-create"));
    });
  }

  const railCreate = document.querySelector(".nav-rail a[data-action='create']");
  if (railCreate) {
    railCreate.addEventListener("click", (e) => {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent("kf:open-create"));
    });
  }

  const hash = window.location.hash.replace("#", "");
  if (hash === "rules") switchView("rules");
  if (hash === "settings") switchView("settings");
  if (hash === "create") document.dispatchEvent(new CustomEvent("kf:open-create"));

  window.addEventListener("hashchange", () => {
    const h = window.location.hash.replace("#", "");
    if (h === "rules") switchView("rules");
    if (h === "settings") switchView("settings");
    if (h === "topics") switchView("topics");
  });

  applyCollapsed();
}

document.addEventListener("DOMContentLoaded", () => {
  refreshStatic();
  initChrome();
});
