const historyListElement = document.querySelector("#history-list");
const statusMessageElement = document.querySelector("#status-message");
const summaryElement = document.querySelector("#history-summary");
const searchInputElement = document.querySelector("#search-input");
const historyItemTemplate = document.querySelector("#history-item-template");

const state = {
  items: [],
  filteredItems: [],
};

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizeHistoryDocument = (document) => {
  const items = Array.isArray(document?.items) ? document.items : [];

  return items
    .filter((item) => item && item.id)
    .sort((leftItem, rightItem) => {
      const leftTime = new Date(leftItem.archivedAt || 0).getTime();
      const rightTime = new Date(rightItem.archivedAt || 0).getTime();
      return rightTime - leftTime;
    });
};

const renderSummary = () => {
  summaryElement.textContent = `Łącznie ${state.filteredItems.length} z ${state.items.length} filmów.`;
};

const renderEmptyState = (message) => {
  historyListElement.hidden = true;
  historyListElement.replaceChildren();
  statusMessageElement.hidden = false;
  statusMessageElement.textContent = message;
  renderSummary();
};

const renderList = () => {
  if (state.filteredItems.length === 0) {
    renderEmptyState("Brak filmów pasujących do wyszukiwania.");
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const item of state.filteredItems) {
    const node = historyItemTemplate.content.cloneNode(true);

    node.querySelector(".history-card__year").textContent = item.year || "Brak roku";
    node.querySelector(".history-card__rating").textContent = Number.isFinite(Number(item.filmwebRating))
      ? `Filmweb ${Number(item.filmwebRating).toFixed(1)}`
      : "Brak oceny";
    node.querySelector(".history-card__title").textContent = item.title || "Nieznany tytuł";
    node.querySelector(".history-card__scheduled").textContent = `Zaplanowano: ${formatDateTime(item.scheduledAt)}`;
    node.querySelector(".history-card__archived").textContent = `Zarchiwizowano: ${formatDateTime(item.archivedAt)}`;

    const linkElement = node.querySelector(".history-card__link");
    linkElement.href = item.filmwebLink || "#";

    fragment.append(node);
  }

  historyListElement.replaceChildren(fragment);
  historyListElement.hidden = false;
  statusMessageElement.hidden = true;
  renderSummary();
};

const applyFilter = () => {
  const query = searchInputElement.value.trim().toLowerCase();

  if (!query) {
    state.filteredItems = [...state.items];
    renderList();
    return;
  }

  state.filteredItems = state.items.filter((item) => {
    const haystack = [
      item.title,
      item.year,
      item.filmwebLink,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  renderList();
};

const bootstrap = async () => {
  try {
    const response = await fetch("./history.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const document = await response.json();
    state.items = normalizeHistoryDocument(document);
    state.filteredItems = [...state.items];

    if (state.items.length === 0) {
      renderEmptyState("Historia jest jeszcze pusta.");
      return;
    }

    renderList();
  } catch (error) {
    console.error("HISTORY_BOOTSTRAP_FAILED", error);
    renderEmptyState("Nie udało się wczytać historii filmów.");
  }
};

searchInputElement.addEventListener("input", applyFilter);
bootstrap();
