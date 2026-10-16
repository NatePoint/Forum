let topicId = null;
let topicData = null;

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showError(message) {
  document.getElementById("topic-container").innerHTML =
    '<div class="error-box">' + escapeHtml(message) + "</div>" +
    '<a class="btn btn-secondary" href="index.html">' + escapeHtml(t("back.topics")) + "</a>";
}

async function loadTopic() {
  if (!fb.ready) {
    showError(t("err.fbsetup"));
    return;
  }
  if (!topicId) {
    showError(t("topic.noId"));
    return;
  }
  try {
    const doc = await fb.db.collection("topics").doc(topicId).get();
    if (!doc.exists) {
      showError(t("topic.deleted"));
      return;
    }
    topicData = Object.assign({ id: doc.id }, doc.data());
    renderTopic();
    subscribeToAnswers();
  } catch (e) {
    showError(t("topic.errload") + e.message);
  }
}

function getTopicIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderTopic() {
  document.title = topicData.title + " — " + t("app.name");
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
        '<div class="error-box">' + escapeHtml(t("answers.errload") + e.message) + "</div>";
    });
}

function renderAnswers(answers) {
  const listEl = document.getElementById("answers-list");
  setStat("answers-count", answers.length);
  setStat("side-answers-count", answers.length);
  setStat("answers-count-header", answers.length);
  const solvedText = topicData.bestAnswerId ? t("yes") : t("no");
  setStat("solved-status", solvedText);
  setStat("side-solved-status", solvedText);

  if (!answers.length) {
    listEl.innerHTML = '<div class="empty-state">' + escapeHtml(t("answers.empty")) + "</div>";
    return;
  }

  const bestId = topicData.bestAnswerId;

  listEl.innerHTML = answers.map((a) => {
    const isBest = a.id === bestId;
    const bestBadge = isBest ? '<span class="badge-best">' + escapeHtml(t("card.best")) + "</span>" : "";
    const actionBtn = isBest
      ? '<button class="btn btn-small btn-secondary" data-unmark="' + a.id + '">' + escapeHtml(t("answer.unmark")) + "</button>"
      : '<button class="btn btn-small" data-mark="' + a.id + '">' + escapeHtml(t("answer.mark")) + "</button>";
    return (
      '<article class="answer' + (isBest ? " is-best" : "") + '" id="answer-' + a.id + '">' +
      '<div class="answer-meta">' + escapeHtml(t("answer.by")) + " " + escapeHtml(a.author) + " · " + formatDate(a.createdAt) + bestBadge + "</div>" +
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
  const name = prompt(t("mark.prompt"));
  if (name === null) return;
  if (name.trim().toLowerCase() !== String(topicData.author).trim().toLowerCase()) {
    alert(t("mark.errauthor"));
    return;
  }
  try {
    await fb.db.collection("topics").doc(topicId).update({ bestAnswerId: answerId });
    topicData.bestAnswerId = answerId;
    reloadAnswersOnce();
  } catch (e) {
    alert(t("mark.errsave") + e.message);
  }
}

async function unmarkBest(answerId) {
  const name = prompt(t("unmark.prompt"));
  if (name === null) return;
  if (name.trim().toLowerCase() !== String(topicData.author).trim().toLowerCase()) {
    alert(t("unmark.errauthor"));
    return;
  }
  try {
    await fb.db.collection("topics").doc(topicId).update({ bestAnswerId: null });
    topicData.bestAnswerId = null;
    reloadAnswersOnce();
  } catch (e) {
    alert(t("unmark.errsave") + e.message);
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
    errorEl.textContent = t("reply.errfill");
    errorEl.style.display = "block";
    return;
  }
  if (!fb.ready || !topicData) {
    errorEl.textContent = t("reply.errnofb");
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
    errorEl.textContent = t("reply.errsave") + e.message;
    errorEl.style.display = "block";
  } finally {
    submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  topicId = getTopicIdFromUrl();
  document.getElementById("answerForm").addEventListener("submit", submitAnswer);

  document.addEventListener("kf:refresh", () => {
    if (topicData) {
      renderTopic();
      reloadAnswersOnce();
    }
  });

  loadTopic();
});
