function bindEvents() {
  document.querySelectorAll('a[href="#financeiro"], [data-go-section="financeiro"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      financeDebugLog("finance-link:click", describeFinanceTrigger(event.currentTarget));
      const success = goToSection("financeiro");
      if (success) showNotice("Etapa Plano financeiro aberta.", "success");
    });
  });

  stepList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step]");
    if (button) {
      financeDebugLog("step-link:click", {
        ...describeFinanceTrigger(button),
        targetSection: sections[Number(button.dataset.step)]?.id,
        currentStepBefore: currentStep
      });
      setCurrentStep(Number(button.dataset.step));
    }
  });

  form.addEventListener("input", (event) => {
    if (event.target.matches("[data-field]")) {
      dirty = true;
      saveState();
      markFilledFields();
      updateFinancialCards();
    }

    if (event.target.matches("[data-table]")) {
      const { table, row, column } = event.target.dataset;
      state.tables[table][Number(row)][Number(column)] = event.target.value;
      dirty = true;
      saveState();
      updateFinancialCards();
    }
  });

  form.addEventListener("change", (event) => {
    if (event.target.matches("[data-field]")) {
      dirty = true;
      saveState();
      markFilledFields();
      updateFinancialCards();
    }

    if (event.target.matches("[data-table]")) {
      const { table, row, column } = event.target.dataset;
      state.tables[table][Number(row)][Number(column)] = event.target.value;
      dirty = true;
      saveState();
      updateFinancialCards();
    }

    if (event.target.id === "logoInput") handleLogoUpload(event.target.files[0]);
    if (event.target.id === "attachmentInput") handleAttachments(event.target.files, event.target);
  });

  form.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-row]");
    const remove = event.target.closest("[data-remove-row]");
    if (add) {
      addTableRow(add.dataset.addRow);
      buttonFeedback(add, "success", "Adicionado");
    }
    if (remove) {
      removeTableRow(remove.dataset.removeRow, Number(remove.dataset.row));
      buttonFeedback(remove, "success", "Removido");
    }

    const recalculate = event.target.closest("#recalculateFinanceButton");
    if (recalculate) recalculateFinancialPlan(recalculate);
  });

  document.getElementById("nextButton").addEventListener("click", nextStep);
  document.getElementById("bottomNextButton").addEventListener("click", nextStep);
  document.getElementById("prevButton").addEventListener("click", prevStep);
  document.getElementById("bottomPrevButton").addEventListener("click", prevStep);
  document.getElementById("saveButton").addEventListener("click", (event) => {
    if (saveState(true)) {
      buttonFeedback(event.currentTarget, "success", "Salvo");
    } else {
      buttonFeedback(event.currentTarget, "error", "Erro");
    }
  });
  document.getElementById("exportButton").addEventListener("click", (event) => exportJSON(event.currentTarget));
  document.getElementById("importFile").addEventListener("change", importJSON);
  document.getElementById("printButton").addEventListener("click", (event) => printReport(event.currentTarget));
  document.getElementById("clearButton").addEventListener("click", (event) => clearAll(event.currentTarget));
  document.getElementById("continueButton").addEventListener("click", (event) => {
    document.getElementById("workspace").scrollIntoView({ behavior: "smooth" });
    buttonFeedback(event.currentTarget, "success", "Abrindo");
  });
  window.addEventListener("beforeprint", () => buildPrintReport());

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

function setCurrentStep(index) {
  currentStep = Math.max(0, Math.min(index, sections.length - 1));
  document.querySelectorAll(".form-step").forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === currentStep));
  document.querySelectorAll(".step-link").forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === currentStep));
  document.getElementById("currentStepTitle").textContent = sections[currentStep].title;
  document.getElementById("prevButton").disabled = currentStep === 0;
  document.getElementById("bottomPrevButton").disabled = currentStep === 0;
  document.getElementById("nextButton").textContent = currentStep === sections.length - 1 ? "Concluir" : "Próxima etapa";
  document.getElementById("bottomNextButton").textContent = document.getElementById("nextButton").textContent;
  updateProgress();
}

function describeFinanceTrigger(element) {
  return {
    tagName: element?.tagName,
    id: element?.id || "",
    href: element?.getAttribute?.("href") || "",
    classes: element?.className || "",
    dataset: { ...(element?.dataset || {}) },
    disabled: Boolean(element?.disabled)
  };
}

function goToSection(sectionId) {
  const targetIndex = sections.findIndex((section) => section.id === sectionId);
  financeDebugLog("goToSection:start", {
    sectionId,
    targetIndex,
    currentStepBefore: currentStep,
    targetElementExists: Boolean(document.getElementById(sectionId))
  });

  if (targetIndex < 0) {
    financeDebugLog("goToSection:not-found", { sectionId });
    return false;
  }

  setCurrentStep(targetIndex);
  document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  financeDebugLog("goToSection:success", {
    sectionId,
    targetIndex,
    currentStepAfter: currentStep,
    financialCardsVisible: Boolean(document.getElementById("pontoEquilibrio"))
  });
  return true;
}

function nextStep() {
  if (!saveState(true)) {
    buttonFeedback(document.getElementById("nextButton"), "error", "Erro");
    buttonFeedback(document.getElementById("bottomNextButton"), "error", "Erro");
    return;
  }

  const missing = requiredMissingInCurrentStep();
  if (missing.length) {
    showNotice(`Revise os campos obrigatórios desta etapa: ${missing.join(", ")}.`, "error");
    buttonFeedback(document.getElementById("nextButton"), "error", "Revise");
    buttonFeedback(document.getElementById("bottomNextButton"), "error", "Revise");
    return;
  }
  buttonFeedback(document.getElementById("nextButton"), "success", currentStep < sections.length - 1 ? "OK" : "Salvo");
  buttonFeedback(document.getElementById("bottomNextButton"), "success", currentStep < sections.length - 1 ? "OK" : "Salvo");
  if (currentStep < sections.length - 1) setCurrentStep(currentStep + 1);
  else showNotice("Plano salvo. Você já pode exportar ou imprimir o relatório.", "success");
}

function prevStep() {
  saveState();
  buttonFeedback(document.getElementById("prevButton"), "success", "OK");
  buttonFeedback(document.getElementById("bottomPrevButton"), "success", "OK");
  setCurrentStep(currentStep - 1);
}

function requiredMissingInCurrentStep() {
  return (sections[currentStep].fields || [])
    .filter((field) => field.required && !isFilled(getField(field.name)))
    .map((field) => field.label);
}

function addTableRow(tableId) {
  const table = findTableConfig(tableId);
  state.tables[tableId].push(emptyRow(table));
  renderTableRows(table);
  saveState();
  showNotice("Linha adicionada com sucesso.", "success");
}

function removeTableRow(tableId, rowIndex) {
  const table = findTableConfig(tableId);
  state.tables[tableId].splice(rowIndex, 1);
  if (state.tables[tableId].length === 0) state.tables[tableId].push(emptyRow(table));
  renderTableRows(table);
  saveState();
  showNotice("Linha removida com sucesso.", "success");
}
