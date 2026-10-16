const TOPICS_PER_PAGE = 10;

function showContentError(message) {
  const el = document.getElementById("topic-list");
  if (el) {
    el.innerHTML = '<div class="error-box">' + escapeHtml(message) + "</div>";
  }
}

let allTopicsCache = [];

async function loadAllTopics() {
  if (!fb.ready) {
    showContentError(t("err.fbsetup"));
    return;
  }
  try {
    const snap = await fb.db.collection("topics").orderBy("createdAt", "desc").get();
    allTopicsCache = snap.docs.map((doc) => Object.assign({ id: doc.id }, doc.data()));
    renderStats(allTopicsCache);
    renderPaginationControls();
    renderPage();
  } catch (e) {
    showContentError(t("err.load") + e.message);
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
    listEl.innerHTML = '<div class="empty-state">' + escapeHtml(t("index.empty")) + "</div>";
    return;
  }

  if (!slice.length) {
    setPage(1);
    return;
  }

  listEl.innerHTML = slice.map(renderTopicCard).join("");
}

function renderTopicCard(tp) {
  const excerpt = tp.text.length > 180 ? tp.text.slice(0, 180) + "..." : tp.text;
  const answersCount = typeof tp.answersCount === "number" ? tp.answersCount : 0;
  const bestMark = tp.bestAnswerId ? '<span class="badge-best">' + escapeHtml(t("card.best")) + "</span>" : "";
  const tags = (tp.tags || []).map((tag) => '<a class="tag" href="#">' + escapeHtml(tag) + "</a>").join(" ");
  return (
    '<article class="topic-card">' +
    '<h2><a href="topic.html?id=' + tp.id + '">' + escapeHtml(tp.title) + "</a>" + bestMark + "</h2>" +
    '<div class="topic-meta">' + escapeHtml(t("card.author")) + " " + escapeHtml(tp.author) + " · " + formatDate(tp.createdAt) +
    " · " + escapeHtml(t("card.answers")) + " " + answersCount + "</div>" +
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
  html += '<button data-page="' + (page - 1) + '"' + (page <= 1 ? " disabled" : "") + ">" + escapeHtml(t("page.prev")) + "</button>";

  for (let i = 1; i <= totalPages; i++) {
    html += '<button data-page="' + i + '"' + (i === page ? ' class="current"' : "") + ">" + i + "</button>";
  }

  html += '<button data-page="' + (page + 1) + '"' + (page >= totalPages ? " disabled" : "") + ">" + escapeHtml(t("page.next")) + "</button>";
  html += '<span class="topic-meta" style="margin-left:12px">' + escapeHtml(t("index.total")) + " " + allTopicsCache.length + "</span>";

  container.innerHTML = html;
  container.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!btn.disabled) setPage(parseInt(btn.dataset.page, 10));
    });
  });
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderStats(topics) {
  const totalAnswers = topics.reduce((sum, tp) => sum + (tp.answersCount || 0), 0);
  const solved = topics.filter((tp) => tp.bestAnswerId).length;
  const authors = new Set(topics.map((tp) => tp.author));

  setStat("stat-topics", topics.length);
  setStat("stat-answers", totalAnswers);
  setStat("stat-solved", solved);
  setStat("stat-authors", authors.size);
  setStat("side-stat-topics", topics.length);
  setStat("side-stat-answers", totalAnswers);
  setStat("side-stat-solved", solved);
  setStat("side-stat-authors", authors.size);

  const tagCounter = {};
  topics.forEach((tp) => {
    (tp.tags || []).forEach((tag) => {
      const key = tag.toLowerCase();
      tagCounter[key] = (tagCounter[key] || 0) + 1;
    });
  });
  const topTags = Object.keys(tagCounter)
    .sort((a, b) => tagCounter[b] - tagCounter[a])
    .slice(0, 8);

  const tagListEl = document.getElementById("popular-tags");
  if (!topTags.length) {
    tagListEl.innerHTML = '<span class="topic-meta">' + escapeHtml(t("sidebar.tags.empty")) + "</span>";
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
    errorEl.textContent = t("err.fill");
    return;
  }
  if (!fb.ready) {
    errorEl.textContent = t("err.nofb");
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
    errorEl.textContent = t("err.save") + e.message;
  } finally {
    submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-open-create").addEventListener("click", openModal);
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("create-modal").addEventListener("click", (e) => {
    if (e.target.id === "create-modal") closeModal();
  });
  document.getElementById("createForm").addEventListener("submit", createTopic);

  document.addEventListener("kf:open-create", openModal);

  document.addEventListener("kf:refresh", () => {
    renderStats(allTopicsCache);
    renderPaginationControls();
    renderPage();
  });

  window.addEventListener("popstate", () => {
    renderPage();
    renderPaginationControls();
  });

  loadAllTopics();
});
