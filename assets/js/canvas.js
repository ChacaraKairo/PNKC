const CANVAS_STORAGE_KEY = "pnkc_canvas_v1";
const BUSINESS_PLAN_STORAGE_KEY = "planopro_business_plan_v2";
const CANVAS_NOTE_MAX_LENGTH = 280;

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
const saveCanvasButton = document.getElementById("saveCanvasButton");
const exportCanvasButton = document.getElementById("exportCanvasButton");
const importCanvasFile = document.getElementById("importCanvasFile");
const exportCanvasPngButton = document.getElementById("exportCanvasPngButton");
const copyCanvasPromptButton = document.getElementById("copyCanvasPromptButton");
const focusCanvasFormButton = document.getElementById("focusCanvasFormButton");
const canvasSavedStatus = document.getElementById("canvasSavedStatus");
const canvasNotice = document.getElementById("canvasNotice");
const canvasExportCompanyName = document.getElementById("canvasExportCompanyName");
const canvasExportCompanyLogo = document.getElementById("canvasExportCompanyLogo");
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
  noteMaxLength: CANVAS_NOTE_MAX_LENGTH,
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

    return normalizeCanvasState(JSON.parse(stored));
  } catch {
    return createDefaultCanvasState();
  }
}

function normalizeCanvasState(input) {
  const normalized = createDefaultCanvasState();
  normalized.version = 1;
  normalized.updatedAt = input?.updatedAt || null;

  Object.keys(normalized.sections).forEach((sectionId) => {
    const notes = input?.sections?.[sectionId];
    normalized.sections[sectionId] = Array.isArray(notes)
      ? notes
        .filter((note) => note && typeof note.text === "string" && note.text.trim())
        .map((note) => normalizeCanvasNote(sectionId, note))
      : [];
  });

  return normalized;
}

function normalizeCanvasNote(sectionId, note) {
  const now = new Date().toISOString();
  const text = normalizeCanvasNoteText(note.text);
  return {
    id: note.id || createCanvasNoteId(),
    sectionId,
    text,
    color: note.color || "yellow",
    createdAt: note.createdAt || now,
    updatedAt: note.updatedAt || note.createdAt || now
  };
}

function saveCanvasState(showMessage = false) {
  canvasState.updatedAt = new Date().toISOString();
  localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(canvasState));
  updateCanvasSavedStatus();
  if (showMessage) showCanvasNotice("Canvas salvo com sucesso.", "success");
}

function renderCanvasApp() {
  renderCanvasForm();
  renderCanvasBoard();
  renderCanvasExportBranding();
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
          maxlength="${CANVAS_NOTE_MAX_LENGTH}"
          placeholder="Digite uma ideia para ${escapeCanvasHtml(section.title)}"
          aria-label="Nova notinha para ${escapeCanvasHtml(section.title)}"
          aria-describedby="${section.id}Help"
        ></textarea>

        <p class="canvas-input-help" id="${section.id}Help">
          Como preencher: escreva uma ideia objetiva por vez, com exemplos, clientes, recursos, custos ou canais ligados a este bloco.
        </p>

        <div class="canvas-character-counter" data-canvas-counter="${section.id}">
          0 / ${CANVAS_NOTE_MAX_LENGTH} caracteres
        </div>

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
  canvasBoard.innerHTML = renderCanvasBoardCells({ full: false });
}

function renderCanvasBoardCells({ full = false } = {}) {
  return CANVAS_SECTIONS.map((section) => {
    const notes = canvasState.sections[section.id] || [];
    const visibleNotes = full ? notes : notes.slice(0, 4);
    const remaining = Math.max(0, notes.length - visibleNotes.length);
    const articleAttrs = full
      ? `class="canvas-cell" data-section-id="${section.id}"`
      : `class="canvas-cell" data-section-id="${section.id}" tabindex="0" role="button" aria-label="Abrir secao ${escapeCanvasHtml(section.title)}"`;

    return `
      <article ${articleAttrs}>
        <div class="canvas-cell-head">
          <h3>${escapeCanvasHtml(section.title)}</h3>
          <span>${notes.length}</span>
        </div>
        <p class="canvas-cell-description">${escapeCanvasHtml(section.description)}</p>

        <div class="canvas-cell-notes">
          ${visibleNotes.map((note) => `
            <div class="canvas-note">${escapeCanvasHtml(full ? note.text : truncateText(note.text, 90))}</div>
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
  document.addEventListener("input", handleCanvasInput);

  clearCanvasButton?.addEventListener("click", clearCanvas);
  saveCanvasButton?.addEventListener("click", () => saveCanvasState(true));
  exportCanvasButton?.addEventListener("click", exportCanvasJSON);
  importCanvasFile?.addEventListener("change", importCanvasJSON);
  exportCanvasPngButton?.addEventListener("click", exportCanvasPNG);
  copyCanvasPromptButton?.addEventListener("click", () => copyCanvasPrompt(copyCanvasPromptButton));
  modalClose?.addEventListener("click", closeCanvasModal);
  modalAddButton?.addEventListener("click", () => focusSectionInput(activeModalSectionId));
  focusCanvasFormButton?.addEventListener("click", () => focusSectionInput(CANVAS_SECTIONS[0].id));
  modalBackdrop?.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeCanvasModal();
  });
}

function handleCanvasInput(event) {
  const input = event.target.closest("[data-note-input]");
  if (!input) return;

  updateCanvasNoteCounter(input.dataset.noteInput);
}

async function copyCanvasPrompt(button) {
  const copied = await copyCanvasTextToClipboard(buildCanvasPrompt());

  if (copied) {
    canvasButtonFeedback(button, "success", "Copiado");
    showCanvasNotice("Perguntas do Canvas copiadas. Cole em uma IA para receber ajuda no preenchimento.", "success");
  } else {
    canvasButtonFeedback(button, "error", "Erro");
    showCanvasNotice("Nao foi possivel copiar automaticamente. Verifique a permissao de area de transferencia do navegador.", "error");
  }
}

function buildCanvasPrompt() {
  const lines = [
    "Quero ajuda para preencher um Business Model Canvas.",
    "Use os blocos, perguntas e explicacoes abaixo para me orientar. Faca perguntas objetivas quando faltar informacao e nao invente dados.",
    "",
    "Blocos do Canvas:"
  ];

  CANVAS_SECTIONS.forEach((section, index) => {
    lines.push("");
    lines.push(`${index + 1}. ${section.title}`);
    lines.push(`   Pergunta principal: ${section.description}`);
    lines.push("   Como preencher: escreva ideias objetivas, com exemplos de clientes, recursos, custos, canais, parcerias ou receitas ligados a este bloco.");
  });

  lines.push("");
  lines.push("Me ajude a transformar minhas ideias em notinhas curtas e claras para cada bloco do Canvas.");
  return lines.join("\n");
}

async function copyCanvasTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    return copyCanvasTextWithFallback(text);
  }

  return copyCanvasTextWithFallback(text);
}

function copyCanvasTextWithFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  textarea.remove();
  return copied;
}

function canvasButtonFeedback(button, type, label) {
  if (!button) return;
  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.classList.remove("feedback-success", "feedback-error");
  button.classList.add(type === "success" ? "feedback-success" : "feedback-error");
  button.textContent = label;
  window.setTimeout(() => {
    button.classList.remove("feedback-success", "feedback-error");
    button.textContent = originalText;
  }, 1800);
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
  const text = normalizeCanvasNoteText(input?.value);

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
  window.setTimeout(() => updateCanvasNoteCounter(sectionId), 260);
}

function clearCanvas() {
  const confirmed = window.confirm("Tem certeza que deseja apagar todas as notinhas do Canvas?");
  if (!confirmed) return;

  canvasState = createDefaultCanvasState();
  saveCanvasState();
  renderCanvasApp();
  closeCanvasModal();
}

function exportCanvasJSON() {
  saveCanvasState();

  const blob = new Blob([JSON.stringify(canvasState, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `canvas-pnkc-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showCanvasNotice("JSON do Canvas exportado com sucesso.", "success");
}

function importCanvasJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result).replace(/^\uFEFF/, ""));
      canvasState = normalizeCanvasState(parsed);
      saveCanvasState();
      renderCanvasApp();
      showCanvasNotice("Canvas importado com sucesso.", "success");
    } catch (error) {
      console.error("[PNKC CANVAS IMPORT ERROR]", error);
      showCanvasNotice("Arquivo JSON do Canvas invalido.", "error");
    }
  };

  reader.readAsText(file);
  event.target.value = "";
}

async function exportCanvasPNG() {
  if (typeof html2canvas !== "function") {
    showCanvasNotice("Biblioteca de exportacao PNG nao carregada.", "error");
    return;
  }

  document.body.classList.add("canvas-exporting");
  let target = null;

  try {
    renderCanvasExportBranding();
    target = createFullCanvasExportSurface();
    const canvas = await html2canvas(target, {
      backgroundColor: "#fffdf7",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      windowWidth: Math.max(1600, target.scrollWidth),
      windowHeight: Math.max(1200, target.scrollHeight)
    });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    link.href = url;
    link.download = `canvas-pnkc-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    showCanvasNotice("PNG do Canvas exportado com sucesso.", "success");
  } catch (error) {
    console.error("[PNKC CANVAS PNG ERROR]", error);
    showCanvasNotice("Nao foi possivel exportar o Canvas em PNG.", "error");
  } finally {
    target?.remove();
    document.body.classList.remove("canvas-exporting");
  }
}

function createFullCanvasExportSurface() {
  const surface = document.createElement("section");
  const companyName = canvasExportCompanyName?.textContent || "Koru Company";
  const companyLogo = canvasExportCompanyLogo?.src || "";
  const canEmbedCompanyLogo = companyLogo.startsWith("data:image/");

  surface.className = "canvas-export-surface canvas-export-full-surface";
  surface.setAttribute("aria-hidden", "true");
  surface.innerHTML = `
    <div class="canvas-export-header">
      <div class="canvas-export-logo-mark" aria-label="Koru Company">KORU</div>
      <div>
        <strong>Business Model Canvas</strong>
        <span>${escapeCanvasHtml(companyName)}</span>
      </div>
      ${canEmbedCompanyLogo ? `<img src="${companyLogo}" alt="Logo da empresa" />` : ""}
    </div>
    <div class="canvas-board canvas-board-full">
      ${renderCanvasBoardCells({ full: true })}
    </div>
    <div class="canvas-export-watermark" aria-hidden="true">KORU</div>
    <p class="canvas-export-signature">
      Koru Company - Business Model Canvas
    </p>
  `;

  document.body.appendChild(surface);
  return surface;
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

function updateCanvasNoteCounter(sectionId) {
  const input = document.querySelector(`[data-note-input="${sectionId}"]`);
  const counter = document.querySelector(`[data-canvas-counter="${sectionId}"]`);
  if (!input || !counter) return;

  const currentLength = String(input.value || "").length;
  const remaining = CANVAS_NOTE_MAX_LENGTH - currentLength;
  counter.textContent = `${currentLength} / ${CANVAS_NOTE_MAX_LENGTH} caracteres`;
  counter.classList.toggle("warning", remaining <= Math.ceil(CANVAS_NOTE_MAX_LENGTH * 0.15));
  counter.classList.toggle("danger", remaining <= 0);
  input.classList.toggle("near-limit", remaining <= Math.ceil(CANVAS_NOTE_MAX_LENGTH * 0.15));
  input.classList.toggle("at-limit", remaining <= 0);
}

function normalizeCanvasNoteText(value) {
  return String(value || "").trim().slice(0, CANVAS_NOTE_MAX_LENGTH).trim();
}

function showCanvasNotice(message, type = "success") {
  if (!canvasNotice) return;

  canvasNotice.textContent = message;
  canvasNotice.className = `notice show ${type}`;
  window.clearTimeout(showCanvasNotice.timer);
  showCanvasNotice.timer = window.setTimeout(() => {
    canvasNotice.className = "notice";
    canvasNotice.textContent = "";
  }, 3200);
}

function renderCanvasExportBranding() {
  const companyLogo = readBusinessPlanLogo();
  const companyName = readBusinessPlanCompanyName();

  if (canvasExportCompanyName) canvasExportCompanyName.textContent = companyName;

  if (!canvasExportCompanyLogo) return;
  if (companyLogo) {
    canvasExportCompanyLogo.src = companyLogo;
    canvasExportCompanyLogo.hidden = false;
  } else {
    canvasExportCompanyLogo.hidden = true;
    canvasExportCompanyLogo.removeAttribute("src");
  }
}

function readBusinessPlanLogo() {
  try {
    const stored = localStorage.getItem(BUSINESS_PLAN_STORAGE_KEY);
    if (!stored) return "";

    const parsed = JSON.parse(stored);
    return parsed?.images?.logo || "";
  } catch {
    return "";
  }
}

function readBusinessPlanCompanyName() {
  try {
    const stored = localStorage.getItem(BUSINESS_PLAN_STORAGE_KEY);
    if (!stored) return "Koru Company";

    const parsed = JSON.parse(stored);
    return parsed?.fields?.nomeEmpresa || parsed?.fields?.nomeFantasia || "Koru Company";
  } catch {
    return "Koru Company";
  }
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
