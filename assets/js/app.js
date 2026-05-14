enrichGuidance();

let state = normalizeState(readStoredState());
let currentStep = 0;
let dirty = false;
let noticeTimer;

const form = document.getElementById("planForm");
const stepList = document.getElementById("stepList");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

window.inspectPrintReport = inspectPrintReport;
window.goToSection = goToSection;
pdfDebugLog("app:initial-state", {
  storageKey: STORAGE_KEY,
  storedSize: localStorage.getItem(STORAGE_KEY)?.length || 0,
  legacyStoredSize: localStorage.getItem(LEGACY_KEY)?.length || 0,
  stateSummary: summarizeState(state),
  criticalFields: summarizeCriticalFields(state),
  tables: summarizeTables(state.tables)
});

window.buildPrintReport = buildPrintReport;

renderApp();
