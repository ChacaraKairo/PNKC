function collectFields() {
  const fields = Array.from(form.querySelectorAll("[data-field]"));
  const beforeFilled = Object.values(state.fields || {}).filter(isFilled).length;
  fields.forEach((field) => {
    state.fields[field.dataset.field] = normalizeFieldValueByLimit(field.dataset.field, field.value);
  });
  pdfDebugLog("collectFields", {
    inputCount: form.querySelectorAll("input").length,
    textareaCount: form.querySelectorAll("textarea").length,
    selectCount: form.querySelectorAll("select").length,
    dataFieldCount: fields.length,
    collectedFilledCount: fields.filter((field) => isFilled(field.value)).length,
    beforeFilled,
    afterFilled: Object.values(state.fields || {}).filter(isFilled).length,
    requiredFields: sections.flatMap((section) => section.fields || []).filter((field) => field.required).map((field) => ({
      name: field.name,
      filled: isFilled(state.fields[field.name])
    })),
    criticalFields: summarizeCriticalFields(state)
  });
}

function getField(name) {
  return state.fields[name] || "";
}
