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

let topicId = null;
let topicData = null;

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

function getTopicIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function showError(message) {
  document.getElementById("topic-container").innerHTML =
    '<div class="error-box">' + escapeHtml(message) + "</div>" +
    '<a class="btn btn-secondary" href="index.html">Ко всем темам</a>';
}

async function loadTopic() {
  if (!fb.ready) {
    showError("Firebase не настроен. Вставьте конфиг в начало файла topic.js.");
    return;
  }
  if (!topicId) {
    showError("Тема не найдена: в адресе отсутствует параметр id.");
    return;
  }
  try {
    const doc = await fb.db.collection("topics").doc(topicId).get();
    if (!doc.exists) {
      showError("Такой темы не существует или она была удалена.");
      return;
    }
    topicData = Object.assign({ id: doc.id }, doc.data());
    renderTopic();
    subscribeToAnswers();
  } catch (e) {
    showError("Ошибка загрузки темы: " + e.message);
  }
}

function renderTopic() {
  document.title = topicData.title + " — ЗнаниеОбмен";
  document.getElementById("topic-title").textContent = topicData.title;
  document.getElementById("topic-author").textContent = topicData.author;
  document.getElementById("topic-date").textContent = formatDate(topicData.createdAt);
  document.getElementById("topic-text").textContent = topicData.text;

  const tagsEl = document.getElementById("topic-tags");
  if (topicData.tags && topicData.tags.length) {
    tagsEl.innerHTML = topicData.tags
      .map((tag) => '<span class="tag">' + escapeHtml(tag) + "</span>")
      .join(" ");
  } else {
    tagsEl.innerHTML = "";
  }
}

function subscribeToAnswers() {
  fb.db.collection("answers")
    .where("topicId", "==", topicId)
    .orderBy("createdAt", "asc")
    .onSnapshot((snap) => {
      const answers = snap.docs.map((doc) => Object.assign({ id: doc.id }, doc.data()));
      renderAnswers(answers);
    }, (e) => {
      document.getElementById("answers-list").innerHTML =
        '<div class="error-box">Ошибка загрузки ответов: ' + escapeHtml(e.message) + "</div>";
    });
}

function renderAnswers(answers) {
  const listEl = document.getElementById("answers-list");
  document.getElementById("answers-count").textContent = answers.length;
  document.getElementById("answers-count-header").textContent = answers.length;
  document.getElementById("solved-status").textContent = topicData.bestAnswerId ? "Да" : "Нет";

  if (!answers.length) {
    listEl.innerHTML = '<div class="empty-state">Ответов пока нет. Будьте первым — помогите автору темы.</div>';
    return;
  }

  const bestId = topicData.bestAnswerId;

  listEl.innerHTML = answers.map((a) => {
    const isBest = a.id === bestId;
    const bestBadge = isBest ? '<span class="badge-best">Лучший ответ</span>' : "";
    const actionBtn = isBest
      ? '<button class="btn btn-small btn-secondary" data-unmark="' + a.id + '">Снять отметку</button>'
      : '<button class="btn btn-small" data-mark="' + a.id + '">Лучший ответ</button>';
    return (
      '<article class="answer' + (isBest ? " is-best" : "") + '" id="answer-' + a.id + '">' +
      '<div class="answer-meta">Ответил: ' + escapeHtml(a.author) + " · " + formatDate(a.createdAt) + bestBadge + "</div>" +
      '<div class="answer-text">' + escapeHtml(a.text) + "</div>" +
      '<div class="answer-actions">' + actionBtn + "</div>" +
      "</article>"
    );
  }).join("");

  listEl.querySelectorAll("button[data-mark]").forEach((btn) => {
    btn.addEventListener("click", () => markBest(btn.dataset.mark));
  });
  listEl.querySelectorAll("button[data-unmark]").forEach((btn) => {
    btn.addEventListener("click", () => unmarkBest(btn.dataset.unmark));
  });
}

async function markBest(answerId) {
  const name = prompt("Для отметки лучшего ответа введите имя автора темы:");
  if (name === null) return;
  if (name.trim().toLowerCase() !== String(topicData.author).trim().toLowerCase()) {
    alert("Отметить лучший ответ может только автор темы.");
    return;
  }
  try {
    await fb.db.collection("topics").doc(topicId).update({ bestAnswerId: answerId });
    topicData.bestAnswerId = answerId;
    reloadAnswersOnce();
  } catch (e) {
    alert("Не удалось отметить ответ: " + e.message);
  }
}

async function unmarkBest(answerId) {
  const name = prompt("Для снятия отметки введите имя автора темы:");
  if (name === null) return;
  if (name.trim().toLowerCase() !== String(topicData.author).trim().toLowerCase()) {
    alert("Снять отметку может только автор темы.");
    return;
  }
  try {
    await fb.db.collection("topics").doc(topicId).update({ bestAnswerId: null });
    topicData.bestAnswerId = null;
    reloadAnswersOnce();
  } catch (e) {
    alert("Не удалось снять отметку: " + e.message);
  }
}

function reloadAnswersOnce() {
  fb.db.collection("answers")
    .where("topicId", "==", topicId)
    .orderBy("createdAt", "asc")
    .get()
    .then((snap) => {
      renderAnswers(snap.docs.map((doc) => Object.assign({ id: doc.id }, doc.data())));
    });
}

async function submitAnswer(event) {
  event.preventDefault();
  const text = document.getElementById("field-answer-text").value.trim();
  const author = document.getElementById("field-answer-author").value.trim();
  const errorEl = document.getElementById("answer-error");

  errorEl.style.display = "none";
  errorEl.textContent = "";

  if (!text || !author) {
    errorEl.textContent = "Заполните текст ответа и ваше имя.";
    errorEl.style.display = "block";
    return;
  }
  if (!fb.ready || !topicData) {
    errorEl.textContent = "Firebase не настроен — отправка невозможна.";
    errorEl.style.display = "block";
    return;
  }

  const submitBtn = document.getElementById("btn-submit-answer");
  submitBtn.disabled = true;

  try {
    await fb.db.collection("answers").add({
      topicId: topicId,
      text: text,
      author: author,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await fb.db.collection("topics").doc(topicId).update({
      answersCount: firebase.firestore.FieldValue.increment(1)
    });
    document.getElementById("answerForm").reset();
  } catch (e) {
    errorEl.textContent = "Ошибка сохранения ответа: " + e.message;
    errorEl.style.display = "block";
  } finally {
    submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  topicId = getTopicIdFromUrl();
  document.getElementById("answerForm").addEventListener("submit", submitAnswer);
  loadTopic();
});
