function normalizeState(raw) {
  pdfDebugLog("normalizeState", {
    rawSummary: summarizeState(raw || {}),
    rawKeys: Object.keys(raw || {})
  });
  return {
    version: 2,
    updatedAt: raw?.updatedAt || null,
    fields: raw?.fields || {},
    tables: raw?.tables || {},
    images: {
      logo: raw?.images?.logo || null,
      anexos: Array.isArray(raw?.images?.anexos) ? raw.images.anexos : []
    }
  };
}

function readStoredState() {
  pdfDebugLog("readStoredState:start", {
    storageKey: STORAGE_KEY,
    hasCurrent: Boolean(localStorage.getItem(STORAGE_KEY)),
    currentSize: localStorage.getItem(STORAGE_KEY)?.length || 0,
    hasLegacy: Boolean(localStorage.getItem(LEGACY_KEY)),
    legacySize: localStorage.getItem(LEGACY_KEY)?.length || 0
  });
  try {
    const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY)) || JSON.parse(localStorage.getItem(LEGACY_KEY)) || {};
    pdfDebugLog("readStoredState:success", { loadedSummary: summarizeState(loaded) });
    return loaded;
  } catch (error) {
    pdfDebugError("readStoredState:error", error);
    return {};
  }
}

function saveState(showMessage = false) {
  pdfDebugLog("saveState:start", { showMessage, before: summarizeState(state) });
  collectFields();
  state.updatedAt = new Date().toISOString();
  const saved = persistState();
  dirty = !saved;
  updateProgress();
  if (showMessage && saved) showNotice("Rascunho salvo neste navegador.", "success");
  pdfDebugLog("saveState:done", { saved, dirty, after: summarizeState(state) });
  return saved;
}

function persistState() {
  if (!state.images.logo && state.images.anexos.length === 0) storageMode = "full";
  const payload = storageMode === "full" ? state : createTextOnlyState();

  try {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    if (!isQuotaExceeded(error)) {
      notifyStorageFailure("Não foi possível salvar o rascunho neste navegador.");
      return false;
    }

    try {
      storageMode = "text-only";
      localStorage.removeItem(LEGACY_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createTextOnlyState()));
      notifyStorageFailure("O navegador atingiu o limite de armazenamento. O texto foi salvo, mas as imagens não cabem no rascunho local. Remova anexos grandes ou exporte o JSON para guardar uma cópia completa.");
      return true;
    } catch {
      notifyStorageFailure("O navegador não conseguiu salvar porque o armazenamento local está cheio. Exporte o JSON e remova imagens grandes para continuar com autosave.");
      return false;
    }
  }
}

function createTextOnlyState() {
  return {
    ...state,
    images: {
      logo: null,
      anexos: []
    },
    storageWarning: "Imagens omitidas do autosave local por limite de armazenamento do navegador."
  };
}

function isQuotaExceeded(error) {
  return error?.name === "QuotaExceededError" || error?.code === 22 || error?.code === 1014;
}

function notifyStorageFailure(message) {
  const now = Date.now();
  if (now - lastQuotaNoticeAt < 4000) return;
  lastQuotaNoticeAt = now;
  showNotice(message, "error");
}
