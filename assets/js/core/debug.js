function isPdfDebugEnabled() {
  return PDF_DEBUG || window.PNKC_PDF_DEBUG === true || new URLSearchParams(window.location.search).get("debugPdf") === "1";
}

function pdfDebugLog(step, payload = {}) {
  if (!isPdfDebugEnabled()) return;
  console.groupCollapsed(`[PNKC PDF DEBUG] ${step}`);
  console.log(payload);
  console.groupEnd();
}

function pdfDebugWarn(step, payload = {}) {
  if (!isPdfDebugEnabled()) return;
  console.groupCollapsed(`[PNKC PDF DEBUG:WARN] ${step}`);
  console.warn(payload);
  console.groupEnd();
}

function pdfDebugError(step, error, payload = {}) {
  if (!isPdfDebugEnabled()) return;
  console.groupCollapsed(`[PNKC PDF DEBUG:ERROR] ${step}`);
  console.error(error, payload);
  console.groupEnd();
}

function financeDebugLog(step, payload = {}) {
  if (!isPdfDebugEnabled()) return;
  console.groupCollapsed(`[PNKC FINANCE DEBUG] ${step}`);
  console.log(payload);
  console.groupEnd();
}

function summarizeFields(fields) {
  return Object.fromEntries(
    Object.entries(fields || {}).map(([key, value]) => [
      key,
      {
        hasValue: isFilled(value),
        type: typeof value,
        length: String(value ?? "").length
      }
    ])
  );
}

function summarizeState(currentState) {
  return {
    hasState: Boolean(currentState),
    fieldCount: Object.keys(currentState?.fields || {}).length,
    filledFieldCount: Object.values(currentState?.fields || {}).filter(isFilled).length,
    tableKeys: Object.keys(currentState?.tables || {}),
    imageKeys: Object.keys(currentState?.images || {}),
    attachmentCount: currentState?.images?.anexos?.length || 0
  };
}

function summarizeCriticalFields(currentState = state) {
  return Object.fromEntries(CRITICAL_FIELDS.map((field) => {
    const value = currentState?.fields?.[field];
    const numericValue = MONEY_FIELDS.has(field) ? toNumber(value) : null;
    return [field, {
      existsInState: Object.prototype.hasOwnProperty.call(currentState?.fields || {}, field),
      hasValue: isFilled(value),
      type: typeof value,
      length: String(value ?? "").length,
      numericValue
    }];
  }));
}

function summarizeTables(tables = state.tables) {
  return Object.fromEntries(Object.entries(tables || {}).map(([tableId, rows]) => {
    const tableConfig = findTableConfig(tableId);
    const normalizedRows = Array.isArray(rows) ? rows : [];
    return [tableId, {
      rowCount: normalizedRows.length,
      filledRowCount: normalizedRows.filter((row) => Array.isArray(row) && row.some(isFilled)).length,
      configuredColumns: tableConfig?.columns?.length || 0,
      firstRowShape: normalizedRows[0]?.map((value) => ({ hasValue: isFilled(value), type: typeof value, length: String(value ?? "").length })) || []
    }];
  }));
}

function getRealReportText(report) {
  const fixedTexts = [
    "Plano de Negócios — Koru Company",
    "Plano de Negocios - Koru Company",
    "Koru Company — Plano de Negócios",
    "Koru Company - Plano de Negocios",
    "Documento gerado pelo PNKC",
    COMPANY_SITE_URL,
    "KORU COMPANY",
    "Koru Company"
  ];
  let text = report?.textContent || "";
  fixedTexts.forEach((fixed) => {
    text = text.split(fixed).join("");
  });
  return text.replace(/\s+/g, " ").trim();
}

function inspectPrintReport(report) {
  const realText = getRealReportText(report);
  return {
    ready: report?.dataset.ready,
    pageCount: report?.querySelectorAll(".document-page").length || 0,
    sectionCount: report?.querySelectorAll(".document-section").length || 0,
    fieldCount: report?.querySelectorAll(".document-field").length || 0,
    tableCount: report?.querySelectorAll(".document-table").length || 0,
    imageCount: report?.querySelectorAll("img").length || 0,
    textLength: report?.textContent?.trim().length || 0,
    realTextLength: realText.length,
    hasOnlyChromeText: realText.length < 50,
    hasFinancialSection: Boolean(report?.textContent?.includes("Plano financeiro"))
  };
}
