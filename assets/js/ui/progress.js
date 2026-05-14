function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function markFilledFields() {
  form.querySelectorAll("[data-field]").forEach((field) => field.classList.toggle("filled", isFilled(field.value)));
}

function updateProgress() {
  collectFields();
  const allFields = sections.flatMap((section) => section.fields || []).filter((field) => !field.type);
  const filledFields = allFields.filter((field) => isFilled(state.fields[field.name])).length;
  let tableCells = 0;
  let filledTableCells = 0;

  Object.values(state.tables).forEach((rows) => {
    rows.forEach((row) => row.forEach((cell) => {
      tableCells += 1;
      if (isFilled(cell)) filledTableCells += 1;
    }));
  });

  const imageTotal = 2;
  const imageFilled = (state.images.logo ? 1 : 0) + (state.images.anexos.length ? 1 : 0);
  const total = allFields.length + tableCells + imageTotal;
  const filled = filledFields + filledTableCells + imageFilled;
  const progress = Math.min(100, Math.round((filled / Math.max(total, 1)) * 100));
  const startedSections = sections.filter((section) => sectionHasContent(section)).length;

  progressText.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
  setText("homeProgress", `${progress}%`);
  setText("homeSections", `${startedSections}/${sections.length}`);
  setText("homeSaved", state.updatedAt ? new Date(state.updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Ainda não salvo");
  setText("stepSummary", `${startedSections} de ${sections.length} etapas iniciadas.`);

  document.querySelectorAll(".step-link").forEach((button, index) => {
    const section = sections[index];
    const complete = sectionCompletion(section) >= 0.75;
    const missing = (section.fields || []).some((field) => field.required && !isFilled(state.fields[field.name]));
    button.classList.toggle("complete", complete);
    button.classList.toggle("required-missing", missing);
    button.querySelector(".step-state").textContent = complete ? "OK" : missing ? "Obrig." : sectionHasContent(section) ? "Em curso" : "Pendente";
  });
}

function sectionHasContent(section) {
  const fieldContent = (section.fields || []).some((field) => field.type === "logo" ? state.images.logo : field.type === "attachments" ? state.images.anexos.length : isFilled(state.fields[field.name]));
  const tableContent = (section.tables || []).some((table) => (state.tables[table.id] || []).some((row) => row.some(isFilled)));
  return fieldContent || tableContent;
}

function sectionCompletion(section) {
  let total = 0;
  let filled = 0;
  (section.fields || []).forEach((field) => {
    total += 1;
    if (field.type === "logo" && state.images.logo) filled += 1;
    else if (field.type === "attachments" && state.images.anexos.length) filled += 1;
    else if (!field.type && isFilled(state.fields[field.name])) filled += 1;
  });
  (section.tables || []).forEach((table) => {
    (state.tables[table.id] || []).forEach((row) => row.forEach((cell) => {
      total += 1;
      if (isFilled(cell)) filled += 1;
    }));
  });
  return total ? filled / total : 0;
}

function findFirstStartedStep() {
  const index = sections.findIndex(sectionHasContent);
  return index >= 0 ? index : 0;
}

function showNotice(message, type = "success") {
  const notice = document.getElementById("notice");
  notice.textContent = message;
  notice.className = `notice show ${type}`;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.className = "notice", 4200);
}

function buttonFeedback(button, type, label) {
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
