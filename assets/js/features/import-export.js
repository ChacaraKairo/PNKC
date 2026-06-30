function exportJSON(button) {
  try {
    saveState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const company = slug(getField("nomeEmpresa") || "plano-de-negocios");
    link.href = url;
    link.download = `${company}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Arquivo JSON exportado com sucesso.", "success");
    buttonFeedback(button, "success", "Exportado");
  } catch {
    showNotice("Não foi possível exportar o JSON.", "error");
    buttonFeedback(button, "error", "Erro");
  }
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  pdfDebugLog("importJSON:start", { name: file.name, size: file.size, type: file.type });
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result).replace(/^\uFEFF/, ""));
      pdfDebugLog("importJSON:parsed", {
        keys: Object.keys(parsed || {}),
        summary: summarizeState(parsed),
        criticalFields: summarizeCriticalFields(parsed),
        tables: summarizeTables(parsed.tables || {})
      });
      state = normalizeState(parsed);
      state.updatedAt = new Date().toISOString();
      storageMode = "full";
      if (!persistState()) throw new Error("Falha ao salvar importação.");
      dirty = false;
      renderForm();
      setCurrentStep(findFirstStartedStep());
      const limitMessage = limitNormalizationReport.length
        ? " Alguns campos foram reduzidos para respeitar o limite de caracteres do relatÃ³rio."
        : "";
      showNotice(`Plano importado com sucesso.${limitMessage}`, "success");
      buttonFeedback(document.querySelector("label[for='importFile']"), "success", "Importado");
    } catch (error) {
      pdfDebugError("importJSON:error", error);
      showNotice("Arquivo JSON inválido.", "error");
      buttonFeedback(document.querySelector("label[for='importFile']"), "error", "Erro");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function clearAll(button) {
  const confirmed = window.confirm("Tem certeza que deseja apagar todos os dados salvos neste navegador?");
  if (!confirmed) {
    showNotice("Limpeza cancelada. Seus dados foram mantidos.", "success");
    buttonFeedback(button, "success", "Mantido");
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  storageMode = "full";
  state = normalizeState({});
  renderForm();
  setCurrentStep(0);
  updateProgress();
  showNotice("Dados locais apagados.", "success");
  buttonFeedback(button, "success", "Limpo");
}

async function printReport(button) {
  try {
    saveState();
    await buildPrintReport();
    document.body.classList.add("document-preview-active");
    document.getElementById("printReport").scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("postPrintCta")?.removeAttribute("hidden");
    showNotice("Seu plano está pronto. Quer transformar esse planejamento em um site, sistema ou aplicativo? Fale com a Koru Company.", "success");
    buttonFeedback(button, "success", "Preparado");
    window.setTimeout(() => window.print(), 350);
  } catch {
    showNotice("Não foi possível preparar o relatório para impressão.", "error");
    buttonFeedback(button, "error", "Erro");
  }
}
