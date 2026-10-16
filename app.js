const firebaseConfig = {
  // ВСТАВЬ СЮДА СВОЙ КОНФИГ FIREBASE
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const TOPICS_PER_PAGE = 10;

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("ru-RU") + " " +
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function showContentError(message) {
  const el = document.getElementById("topic-list");
  if (el) {
    el.innerHTML = '<div class="error-box">' + escapeHtml(message) + "</div>";
  }
}

let allTopicsCache = [];

async function loadAllTopics() {
  if (!fb.ready) {
    showContentError("Firebase не настроен. Вставьте конфиг в начало файла app.js.");
    return;
  }
  try {
    const snap = await fb.db.collection("topics").orderBy("createdAt", "desc").get();
    allTopicsCache = snap.docs.map((doc) => Object.assign({ id: doc.id }, doc.data()));
    renderStats(allTopicsCache);
    renderPaginationControls();
    renderPage();
  } catch (e) {
    showContentError("Ошибка загрузки данных из Firestore: " + e.message);
  }
}

function getCurrentPage() {
  const params = new URLSearchParams(window.location.search);
  const p = parseInt(params.get("page"), 10);
  return isNaN(p) || p < 1 ? 1 : p;
}

function setPage(page) {
  const url = window.location.pathname + "?page=" + page;
  window.history.pushState({}, "", url);
  renderPage();
  renderPaginationControls();
  window.scrollTo(0, 0);
}

function renderPage() {
  const listEl = document.getElementById("topic-list");
  const page = getCurrentPage();
  const start = (page - 1) * TOPICS_PER_PAGE;
  const slice = allTopicsCache.slice(start, start + TOPICS_PER_PAGE);

  if (!allTopicsCache.length) {
    listEl.innerHTML =
      '<div class="empty-state">Тем пока нет. Создайте первую тему кнопкой справа или в меню слева.</div>';
    return;
  }

  if (!slice.length) {
    setPage(1);
    return;
  }

  listEl.innerHTML = slice.map(renderTopicCard).join("");
}

function renderTopicCard(t) {
  const excerpt = t.text.length > 180 ? t.text.slice(0, 180) + "..." : t.text;
  const answersCount = typeof t.answersCount === "number" ? t.answersCount : 0;
  const bestMark = t.bestAnswerId ? '<span class="badge-best">Лучший ответ</span>' : "";
  const tags = (t.tags || []).map((tag) => '<a class="tag" href="#">' + escapeHtml(tag) + "</a>").join(" ");
  return (
    '<article class="topic-card">' +
    "<h2><a href=\"topic.html?id=" + t.id + "\">" + escapeHtml(t.title) + "</a>" + bestMark + "</h2>" +
    '<div class="topic-meta">Автор: ' + escapeHtml(t.author) + " · " + formatDate(t.createdAt) +
    " · Ответов: " + answersCount + "</div>" +
    '<div class="topic-excerpt">' + escapeHtml(excerpt) + "</div>" +
    (tags ? '<div class="tag-list" style="margin-top:12px">' + tags + "</div>" : "") +
    "</article>"
  );
}

function renderPaginationControls() {
  const container = document.getElementById("pagination");
  const totalPages = Math.max(1, Math.ceil(allTopicsCache.length / TOPICS_PER_PAGE));
  const page = getCurrentPage();

  let html = "";
  html += '<button data-page="' + (page - 1) + '"' + (page <= 1 ? " disabled" : "") + ">Назад</button>";

  for (let i = 1; i <= totalPages; i++) {
    html += '<button data-page="' + i + '"' + (i === page ? ' class="current"' : "") + ">" + i + "</button>";
  }

  html += '<button data-page="' + (page + 1) + '"' + (page >= totalPages ? " disabled" : "") + ">Вперёд</button>";
  html += '<span class="topic-meta" style="margin-left:12px">Всего тем: ' + allTopicsCache.length + "</span>";

  container.innerHTML = html;
  container.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!btn.disabled) setPage(parseInt(btn.dataset.page, 10));
    });
  });
}

function renderStats(topics) {
  const totalAnswers = topics.reduce((sum, t) => sum + (t.answersCount || 0), 0);
  const solved = topics.filter((t) => t.bestAnswerId).length;
  const authors = new Set(topics.map((t) => t.author));

  document.getElementById("stat-topics").textContent = topics.length;
  document.getElementById("stat-answers").textContent = totalAnswers;
  document.getElementById("stat-solved").textContent = solved;
  document.getElementById("stat-authors").textContent = authors.size;

  const tagCounter = {};
  topics.forEach((t) => {
    (t.tags || []).forEach((tag) => {
      const key = tag.toLowerCase();
      tagCounter[key] = (tagCounter[key] || 0) + 1;
    });
  });
  const topTags = Object.keys(tagCounter)
    .sort((a, b) => tagCounter[b] - tagCounter[a])
    .slice(0, 8);

  const tagListEl = document.getElementById("popular-tags");
  if (!topTags.length) {
    tagListEl.innerHTML = '<span class="topic-meta">Тегов пока нет</span>';
  } else {
    tagListEl.innerHTML = topTags
      .map((tag) => '<a class="tag" href="#">' + escapeHtml(tag) + " (" + tagCounter[tag] + ")</a>")
      .join(" ");
  }
}

function openModal() {
  document.getElementById("create-modal").classList.add("open");
  document.getElementById("field-title").focus();
}

function closeModal() {
  document.getElementById("create-modal").classList.remove("open");
}

async function createTopic(event) {
  event.preventDefault();
  const title = document.getElementById("field-title").value.trim();
  const text = document.getElementById("field-text").value.trim();
  const author = document.getElementById("field-author").value.trim();
  const tagsRaw = document.getElementById("field-tags").value.trim();
  const errorEl = document.getElementById("create-error");

  errorEl.textContent = "";
  errorEl.style.display = "block";

  if (!title || !text || !author) {
    errorEl.textContent = "Заполните заголовок, текст и имя автора.";
    return;
  }
  if (!fb.ready) {
    errorEl.textContent = "Firebase не настроен — создание темы невозможно.";
    return;
  }

  const tags = tagsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  const submitBtn = document.getElementById("btn-submit-topic");
  submitBtn.disabled = true;

  try {
    await fb.db.collection("topics").add({
      title: title,
      text: text,
      author: author,
      tags: tags,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      answersCount: 0,
      bestAnswerId: null
    });
    document.getElementById("createForm").reset();
    closeModal();
    await loadAllTopics();
  } catch (e) {
    errorEl.textContent = "Ошибка сохранения: " + e.message;
  } finally {
    submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-open-create").addEventListener("click", openModal);
  document.getElementById("btn-open-create-menu").addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("create-modal").addEventListener("click", (e) => {
    if (e.target.id === "create-modal") closeModal();
  });
  document.getElementById("createForm").addEventListener("submit", createTopic);

  window.addEventListener("popstate", () => {
    renderPage();
    renderPaginationControls();
  });

  document.querySelectorAll(".nav a[data-view]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav a").forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      const view = link.dataset.view;
      document.getElementById("view-rules").style.display = view === "rules" ? "block" : "none";
      document.getElementById("view-topics").style.display = view === "rules" ? "none" : "block";
    });
  });

  loadAllTopics();
});
