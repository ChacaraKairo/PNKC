const CANVAS_STORAGE_KEY = "pnkc_canvas_v1";

const CANVAS_SECTIONS = [
  {
    id: "segmentosClientes",
    title: "Segmentos de Clientes",
    description: "Quem sao os clientes, usuarios ou grupos atendidos pelo negocio?"
  },
  {
    id: "propostaValor",
    title: "Proposta de Valor",
    description: "Qual valor o negocio entrega e qual problema resolve?"
  },
  {
    id: "canais",
    title: "Canais",
    description: "Como o negocio alcanca, vende e entrega valor aos clientes?"
  },
  {
    id: "relacionamentoClientes",
    title: "Relacionamento com Clientes",
    description: "Como a empresa se relaciona, atende e mantem clientes?"
  },
  {
    id: "fontesReceita",
    title: "Fontes de Receita",
    description: "Como o negocio ganha dinheiro?"
  },
  {
    id: "recursosChave",
    title: "Recursos-Chave",
    description: "Quais recursos sao essenciais para operar?"
  },
  {
    id: "atividadesChave",
    title: "Atividades-Chave",
    description: "Quais atividades precisam acontecer para entregar valor?"
  },
  {
    id: "parceriasChave",
    title: "Parcerias-Chave",
    description: "Quais parceiros, fornecedores ou aliados sao importantes?"
  },
  {
    id: "estruturaCustos",
    title: "Estrutura de Custos",
    description: "Quais sao os custos principais do modelo?"
  }
];

let canvasState = readCanvasState();
let activeModalSectionId = null;

const canvasForm = document.getElementById("canvasForm");
const canvasBoard = document.getElementById("canvasBoard");
const clearCanvasButton = document.getElementById("clearCanvasButton");
const focusCanvasFormButton = document.getElementById("focusCanvasFormButton");
const canvasSavedStatus = document.getElementById("canvasSavedStatus");
const modalBackdrop = document.getElementById("canvasModalBackdrop");
const modalClose = document.getElementById("canvasModalClose");
const modalTitle = document.getElementById("canvasModalTitle");
const modalDescription = document.getElementById("canvasModalDescription");
const modalNotes = document.getElementById("canvasModalNotes");
const modalAddButton = document.getElementById("canvasModalAddButton");

renderCanvasApp();
bindCanvasEvents();

window.PNKCCanvas = {
  getState: () => structuredClone(canvasState),
  sections: CANVAS_SECTIONS,
  render: renderCanvasApp
};

function createDefaultCanvasState() {
  return {
    version: 1,
    updatedAt: null,
    sections: Object.fromEntries(CANVAS_SECTIONS.map((section) => [section.id, []]))
  };
}

function readCanvasState() {
  try {
    const stored = localStorage.getItem(CANVAS_STORAGE_KEY);
    if (!stored) return createDefaultCanvasState();

    const parsed = JSON.parse(stored);
    const normalized = createDefaultCanvasState();

    Object.keys(normalized.sections).forEach((sectionId) => {
      normalized.sections[sectionId] = Array.isArray(parsed?.sections?.[sectionId])
        ? parsed.sections[sectionId]
          .filter((note) => note && typeof note.text === "string")
          .map((note) => normalizeCanvasNote(sectionId, note))
        : [];
    });

    normalized.updatedAt = parsed?.updatedAt || null;
    return normalized;
  } catch {
    return createDefaultCanvasState();
  }
}

function normalizeCanvasNote(sectionId, note) {
  const now = new Date().toISOString();
  return {
    id: note.id || createCanvasNoteId(),
    sectionId,
    text: String(note.text || ""),
    color: note.color || "yellow",
    createdAt: note.createdAt || now,
    updatedAt: note.updatedAt || note.createdAt || now
  };
}

function saveCanvasState() {
  canvasState.updatedAt = new Date().toISOString();
  localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(canvasState));
  updateCanvasSavedStatus();
}

function renderCanvasApp() {
  renderCanvasForm();
  renderCanvasBoard();
  updateCanvasSavedStatus();
}

function renderCanvasForm() {
  canvasForm.innerHTML = CANVAS_SECTIONS.map((section) => {
    const notes = canvasState.sections[section.id] || [];

    return `
      <article class="canvas-form-section" data-section-id="${section.id}">
        <h3>${escapeCanvasHtml(section.title)}</h3>
        <p>${escapeCanvasHtml(section.description)}</p>

        <textarea
          class="canvas-note-input"
          data-note-input="${section.id}"
          placeholder="Digite uma ideia para ${escapeCanvasHtml(section.title)}"
          aria-label="Nova notinha para ${escapeCanvasHtml(section.title)}"
        ></textarea>

        <button class="button primary" type="button" data-add-canvas-note="${section.id}">
          Adicionar notinha
        </button>

        <div class="canvas-form-note-list" aria-label="Notinhas de ${escapeCanvasHtml(section.title)}">
          ${notes.length ? notes.map((note) => `
            <div class="canvas-form-note-item" data-note-id="${note.id}">
              <span>${escapeCanvasHtml(truncateText(note.text, 70))}</span>
              <button type="button" class="button danger" data-remove-canvas-note="${section.id}:${note.id}">
                Remover
              </button>
            </div>
          `).join("") : `<p class="canvas-empty-inline">Nenhuma notinha nesta secao.</p>`}
        </div>
      </article>
    `;
  }).join("");
}

function renderCanvasBoard() {
  canvasBoard.innerHTML = CANVAS_SECTIONS.map((section) => {
    const notes = canvasState.sections[section.id] || [];
    const previewNotes = notes.slice(0, 4);
    const remaining = Math.max(0, notes.length - previewNotes.length);

    return `
      <article
        class="canvas-cell"
        data-section-id="${section.id}"
        tabindex="0"
        role="button"
        aria-label="Abrir secao ${escapeCanvasHtml(section.title)}"
      >
        <div class="canvas-cell-head">
          <h3>${escapeCanvasHtml(section.title)}</h3>
          <span>${notes.length}</span>
        </div>
        <p class="canvas-cell-description">${escapeCanvasHtml(section.description)}</p>

        <div class="canvas-cell-notes">
          ${previewNotes.map((note) => `
            <div class="canvas-note">${escapeCanvasHtml(truncateText(note.text, 90))}</div>
          `).join("")}
          ${remaining ? `<p class="canvas-more-notes">+${remaining} notinha(s)</p>` : ""}
          ${notes.length ? "" : `<p class="canvas-empty-cell">Sem notinhas ainda.</p>`}
        </div>
      </article>
    `;
  }).join("");
}

function bindCanvasEvents() {
  document.addEventListener("click", handleCanvasClick);
  document.addEventListener("keydown", handleCanvasKeydown);

  clearCanvasButton?.addEventListener("click", clearCanvas);
  modalClose?.addEventListener("click", closeCanvasModal);
  modalAddButton?.addEventListener("click", () => focusSectionInput(activeModalSectionId));
  focusCanvasFormButton?.addEventListener("click", () => focusSectionInput(CANVAS_SECTIONS[0].id));
  modalBackdrop?.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeCanvasModal();
  });
}

function handleCanvasClick(event) {
  const addButton = event.target.closest("[data-add-canvas-note]");
  if (addButton) {
    addCanvasNote(addButton.dataset.addCanvasNote);
    return;
  }

  const removeButton = event.target.closest("[data-remove-canvas-note]");
  if (removeButton) {
    const [sectionId, noteId] = removeButton.dataset.removeCanvasNote.split(":");
    removeCanvasNote(sectionId, noteId);
    return;
  }

  const cell = event.target.closest(".canvas-cell");
  if (cell) {
    openCanvasModal(cell.dataset.sectionId);
  }
}

function handleCanvasKeydown(event) {
  if (event.key === "Escape") {
    closeCanvasModal();
    return;
  }

  if (event.ctrlKey && event.key === "Enter") {
    const input = event.target.closest("[data-note-input]");
    if (input) {
      event.preventDefault();
      addCanvasNote(input.dataset.noteInput);
      return;
    }
  }

  if (event.key === "Enter") {
    const cell = event.target.closest(".canvas-cell");
    if (cell) {
      event.preventDefault();
      openCanvasModal(cell.dataset.sectionId);
    }
  }
}

function addCanvasNote(sectionId) {
  const input = document.querySelector(`[data-note-input="${sectionId}"]`);
  const text = input?.value?.trim();

  if (!text || !canvasState.sections[sectionId]) {
    input?.focus();
    return;
  }

  const now = new Date().toISOString();
  canvasState.sections[sectionId].push({
    id: createCanvasNoteId(),
    sectionId,
    text,
    color: "yellow",
    createdAt: now,
    updatedAt: now
  });

  saveCanvasState();
  renderCanvasApp();
  const nextInput = document.querySelector(`[data-note-input="${sectionId}"]`);
  nextInput?.focus();
}

function removeCanvasNote(sectionId, noteId) {
  canvasState.sections[sectionId] = (canvasState.sections[sectionId] || [])
    .filter((note) => note.id !== noteId);

  saveCanvasState();
  renderCanvasApp();

  if (!modalBackdrop.hidden && activeModalSectionId === sectionId) {
    openCanvasModal(sectionId);
  }
}

function openCanvasModal(sectionId) {
  const section = CANVAS_SECTIONS.find((item) => item.id === sectionId);
  if (!section) return;

  const notes = canvasState.sections[sectionId] || [];
  activeModalSectionId = sectionId;

  modalTitle.textContent = section.title;
  modalDescription.textContent = section.description;

  modalNotes.innerHTML = notes.length
    ? notes.map((note) => `
      <article class="canvas-note canvas-note-large">
        ${escapeCanvasHtml(note.text)}
      </article>
    `).join("")
    : `<p class="canvas-empty-state">Nenhuma notinha adicionada nesta secao ainda.</p>`;

  modalBackdrop.hidden = false;
  document.body.classList.add("canvas-modal-open");
  modalClose?.focus();
}

function closeCanvasModal() {
  if (!modalBackdrop || modalBackdrop.hidden) return;

  modalBackdrop.hidden = true;
  activeModalSectionId = null;
  document.body.classList.remove("canvas-modal-open");
}

function focusSectionInput(sectionId) {
  const input = document.querySelector(`[data-note-input="${sectionId}"]`);
  closeCanvasModal();
  input?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => input?.focus(), 250);
}

function clearCanvas() {
  const confirmed = window.confirm("Tem certeza que deseja apagar todas as notinhas do Canvas?");
  if (!confirmed) return;

  canvasState = createDefaultCanvasState();
  saveCanvasState();
  renderCanvasApp();
  closeCanvasModal();
}

function updateCanvasSavedStatus() {
  if (!canvasSavedStatus) return;

  if (!canvasState.updatedAt) {
    canvasSavedStatus.textContent = "Nada salvo ainda.";
    return;
  }

  const date = new Date(canvasState.updatedAt);
  canvasSavedStatus.textContent = `Salvo ${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function createCanvasNoteId() {
  return `note_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function truncateText(text, maxLength) {
  const value = String(text || "");
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function escapeCanvasHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
