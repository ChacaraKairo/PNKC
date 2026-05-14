async function buildPrintReport(data = state) {
  const report = document.getElementById("printReport");
  if (!report) throw new Error("Elemento #printReport nao encontrado.");

  pdfDebugLog("buildPrintReport:start", {
    hasReportElement: Boolean(report),
    dataIsState: data === state,
    stateSummary: summarizeState(state),
    inputDataSummary: summarizeState(data),
    criticalFields: summarizeCriticalFields(data),
    tables: summarizeTables(data?.tables || {})
  });

  report.dataset.ready = "false";
  document.body.dataset.printReportReady = "false";
  const html = createBusinessPlanDocumentHtml(data);
  pdfDebugLog("buildPrintReport:html-created", {
    htmlLength: html.length,
    containsDocumentPage: html.includes("document-page"),
    containsDocumentField: html.includes("document-field"),
    containsDocumentTable: html.includes("document-table"),
    containsFinancialSection: html.includes("Plano financeiro"),
    first500Chars: html.slice(0, 500)
  });
  report.innerHTML = html;

  const pages = report.querySelectorAll(".document-page");
  const hasVisibleContent = report.textContent.trim().length > 0 || report.querySelectorAll("img").length > 0;
  pdfDebugLog("buildPrintReport:dom-inserted", inspectPrintReport(report));
  if (!pages.length || !hasVisibleContent) {
    report.dataset.ready = "false";
    throw new Error("Relatorio de impressao vazio. Nenhuma pagina document-* foi gerada.");
  }

  await waitForReportImages(report);
  report.dataset.ready = "true";
  document.body.dataset.printReportReady = "true";
  pdfDebugLog("buildPrintReport:ready", inspectPrintReport(report));
  return true;
}

function waitForReportImages(root) {
  const images = Array.from(root.querySelectorAll("img"));
  pdfDebugLog("waitForReportImages:start", {
    imageCount: images.length,
    images: images.map((image, index) => ({
      index,
      complete: image.complete,
      srcLength: image.currentSrc?.length || image.src?.length || 0,
      alt: image.alt
    }))
  });
  return Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve({ status: "complete" });
    return new Promise((resolve) => {
      image.onload = () => resolve({ status: "loaded" });
      image.onerror = () => {
        pdfDebugWarn("waitForReportImages:error", { srcLength: image.src?.length || 0, alt: image.alt });
        resolve({ status: "error" });
      };
    });
  })).then((results) => {
    pdfDebugLog("waitForReportImages:done", { results });
    return results;
  });
}

function createBusinessPlanDocumentHtml(data = state) {
  const originalState = state;
  pdfDebugLog("createBusinessPlanDocumentHtml:start", {
    dataIsState: data === state,
    originalSummary: summarizeState(originalState),
    dataSummary: summarizeState(data),
    criticalFields: summarizeCriticalFields(data),
    tables: summarizeTables(data?.tables || {})
  });
  if (data && data !== state) state = normalizeState(data);

  try {
  const company = getField("nomeEmpresa") || "Plano de Negócios";
  const location = getField("cidadeUf");
  const year = getField("ano") || new Date().getFullYear();
  const businessLogo = state.images.logo || KORU_LOGO_SRC;
  const primaryColor = sanitizeColor(getField("reportPrimaryColor"), "#171512");
  const accentColor = sanitizeColor(getField("reportAccentColor"), "#b08a4a");
  const printableSections = sections.filter(sectionHasPrintContent);
  const generatedAt = new Date().toLocaleDateString("pt-BR");
  pdfDebugLog("createBusinessPlanDocumentHtml:prepared", {
    company,
    printableSectionIds: printableSections.map((section) => section.id),
    financial: calculateFinancialIndicators(),
    criticalFields: summarizeCriticalFields(state),
    tables: summarizeTables(state.tables)
  });

  const html = `
    <style>
      #printReport {
        --print-primary: ${primaryColor};
        --print-accent: ${accentColor};
      }
    </style>
    ${renderDocumentPage(`
      <div class="document-cover-strip"></div>
      <div class="document-cover-top">
        <img class="document-koru-logo" src="${KORU_LOGO_SRC}" alt="KORU Company">
        <span>KORU COMPANY</span>
      </div>
      <img class="document-logo" src="${businessLogo}" alt="Logo da empresa">
      <p class="document-kicker">Plano de Negócios Estratégico</p>
      <h1>${escapeHtml(company)}</h1>
      <p class="document-subtitle">${escapeHtml(getField("slogan") || "Plano de negócios completo, estruturado e pronto para apresentação.")}</p>
      <dl class="document-meta">
        <div><dt>Local</dt><dd>${escapeHtml(location || "Nao informado")}</dd></div>
        <div><dt>Ano</dt><dd>${escapeHtml(year)}</dd></div>
        <div><dt>Gerado em</dt><dd>${generatedAt}</dd></div>
      </dl>
    `, { pageClass: "document-cover", hideChrome: true })}
    ${renderDocumentSummary(printableSections)}
    ${printableSections.map((section, index) => renderDocumentSection(section, index)).join("")}
    ${renderDocumentImagePages()}
    ${renderDocumentClosing(company, generatedAt)}
  `;
  pdfDebugLog("createBusinessPlanDocumentHtml:html", {
    htmlLength: html.length,
    hasFinancialSection: html.includes("Plano financeiro"),
    hasFinancialDashboard: html.includes("document-finance-dashboard")
  });
  return html;
  } finally {
    pdfDebugLog("createBusinessPlanDocumentHtml:finally", {
      restoredState: data !== originalState,
      currentSummaryBeforeRestore: summarizeState(state),
      originalSummary: summarizeState(originalState)
    });
    state = originalState;
  }
}

function renderDocumentPage(content, options = {}) {
  const pageClass = options.pageClass || "";
  const hideChrome = options.hideChrome ? " no-page-chrome" : "";
  const bodyClass = options.bodyClass || "";

  return `
    <section class="document-page ${pageClass}${hideChrome}">
      <div class="document-watermark" aria-hidden="true"><img src="${KORU_LOGO_SRC}" alt=""></div>
      ${options.hideChrome ? "" : `
        <header class="document-header">
          <img src="${KORU_LOGO_SRC}" alt="KORU Company">
          <span>${PDF_TITLE}</span>
        </header>
      `}
      <main class="document-body ${bodyClass}">
        ${content}
      </main>
      ${options.hideChrome ? "" : `
        <footer class="document-footer">
          <span>Koru Company &mdash; Plano de Neg&oacute;cios</span>
          <span>Documento gerado pelo PNKC</span>
          <span>${COMPANY_SITE_URL}</span>
        </footer>
      `}
    </section>
  `;
}

function sectionHasPrintContent(section) {
  const fields = (section.fields || []).filter((field) => !field.type && !HIDDEN_PRINT_FIELDS.has(field.name) && isFilled(state.fields[field.name]));
  const tables = (section.tables || []).filter((table) => (state.tables[table.id] || []).some((row) => row.some(isFilled)));
  const hasFinanceValues = section.finance && ["receitaBruta", "custosFixos", "custosVariaveis", "lucroLiquido", "investimentoTotal"].some((field) => isFilled(state.fields[field]));
  return Boolean(fields.length || tables.length || hasFinanceValues);
}

function renderDocumentSummary(printableSections) {
  return renderDocumentPage(`
      <div class="document-summary-head">
        <span>Sumário</span>
        <strong>Koru Company</strong>
      </div>
      <h2>Plano de negócios</h2>
      <ol>
        ${printableSections.map((section, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${section.title}</strong><em></em></li>`).join("")}
      </ol>
  `, { pageClass: "document-summary" });
}

function renderDocumentSection(section, index) {
  const fields = (section.fields || []).filter((field) => shouldPrintField(section, field));
  const tables = (section.tables || []).filter((table) => (state.tables[table.id] || []).some((row) => row.some(isFilled)));
  const specialContent = renderSpecialPrintContent(section);
  if (!fields.length && !tables.length && !specialContent) {
    pdfDebugLog("renderDocumentSection", {
      sectionId: section.id,
      title: section.title,
      configuredFields: section.fields?.length || 0,
      filledFields: fields.length,
      configuredTables: section.tables?.length || 0,
      filledTables: tables.length,
      htmlLength: 0,
      skipped: true,
      isFinancial: section.id === "financeiro"
    });
    return "";
  }

  const sectionHtml = renderDocumentPage(`
    <article class="document-section">
      <div class="document-section-title">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h2>${section.title}</h2>
      </div>
      ${fields.map((field) => `<p class="document-field"><strong>${field.label}</strong>${formatDocumentValue(field, state.fields[field.name])}</p>`).join("")}
      ${specialContent}
      ${tables.map(renderDocumentTable).join("")}
    </article>
  `, { pageClass: "document-content-page" });
  pdfDebugLog("renderDocumentSection", {
    sectionId: section.id,
    title: section.title,
    configuredFields: section.fields?.length || 0,
    filledFields: fields.length,
    configuredTables: section.tables?.length || 0,
    filledTables: tables.length,
    htmlLength: sectionHtml.length,
    skipped: false,
    isFinancial: section.id === "financeiro"
  });
  return sectionHtml;
}

function renderDocumentImagePages() {
  pdfDebugLog("renderDocumentImagePages:start", {
    attachmentCount: state.images.anexos?.length || 0,
    attachments: (state.images.anexos || []).map((image, index) => ({
      index,
      type: typeof image,
      hasSrc: Boolean(getAttachmentSrc(image)),
      srcLength: getAttachmentSrc(image).length,
      caption: getAttachmentCaption(image, index)
    }))
  });
  return (state.images.anexos || []).map((image, index) => {
    const src = getAttachmentSrc(image);
    const caption = getAttachmentCaption(image, index);
    if (!src) return "";

    return renderDocumentPage(`
    <figure class="document-image-frame">
      <img src="${src}" alt="${escapeHtml(caption)}">
      <figcaption class="document-image-caption">${escapeHtml(caption)}</figcaption>
    </figure>
  `, { pageClass: "document-image-page", bodyClass: "document-image-body" });
  }).join("");
}

function renderDocumentClosing(company, generatedAt) {
  return renderDocumentPage(`
      <img src="${KORU_LOGO_SRC}" alt="KORU Company">
      <p>Obrigado</p>
      <h2>${escapeHtml(company || "Koru Company")}</h2>
      <strong>Entender antes de desenvolver.</strong>
      <div>
        <span>Plano de Negócios — Koru Company</span>
        <span>Documento gerado em ${generatedAt}</span>
      </div>
  `, { pageClass: "document-closing", hideChrome: true });
}

function shouldPrintField(section, field) {
  if (field.type || HIDDEN_PRINT_FIELDS.has(field.name) || !isFilled(state.fields[field.name])) return false;
  if (section.id === "swot" && ["forcas", "fraquezas", "oportunidades", "ameacas"].includes(field.name)) return false;
  return true;
}

function renderSpecialPrintContent(section) {
  if (section.id === "financeiro") return renderDocumentFinancialDashboard();
  if (section.id === "swot") return renderDocumentSwotMatrix();
  if (section.id === "cronograma") return renderDocumentTimelineRoadmap();
  return "";
}

function renderDocumentFinancialDashboard() {
  const indicators = calculateFinancialIndicators();
  const receita = indicators.receitaTotal;
  const fixos = indicators.custosFixosTotal;
  const variaveis = indicators.custosVariaveisTotal;
  const lucro = indicators.lucroLiquido;
  const investimento = indicators.investimentoTotal;
  const maxValue = Math.max(receita, fixos, variaveis, Math.abs(lucro), investimento, 1);
  const values = [
    ["Receita", receita],
    ["Custos fixos", fixos],
    ["Custos variáveis", variaveis],
    ["Lucro líquido", lucro],
    ["Investimento", investimento],
    ["Capital de giro", indicators.capitalGiro]
  ];

  const html = `
    <div class="document-finance-dashboard">
      ${values.map(([label, value]) => `
        <div class="document-finance-bar">
          <div><strong>${label}</strong><span>${money(value)}</span></div>
          <i style="width:${Math.max(3, Math.round((Math.abs(value) / maxValue) * 100))}%"></i>
        </div>
      `).join("")}
      <div class="document-finance-indicators">
        <p><strong>Ponto de equilíbrio:</strong> ${indicators.pontoEquilibrio !== null ? money(indicators.pontoEquilibrio) : "Não calculável"}</p>
        <p><strong>Lucratividade:</strong> ${indicators.receitaTotal > 0 ? percent(indicators.margemLucro) : "Não calculável"}</p>
        <p><strong>Rentabilidade:</strong> ${indicators.investimentoTotal > 0 ? percent(indicators.rentabilidade) : "Não calculável"}</p>
        <p><strong>Prazo de retorno:</strong> ${indicators.prazoRetornoMeses !== null ? `${indicators.prazoRetornoMeses.toFixed(1).replace(".", ",")} meses` : "Não calculável"}</p>
      </div>
      <p><strong>Interpretação:</strong> o plano financeiro compara receitas, custos e investimento inicial. Quando faltarem dados, os indicadores aparecem como não calculáveis para evitar conclusões falsas.</p>
    </div>
  `;
  pdfDebugLog("renderFinancialSection", {
    hasFinancialFields: ["investimentoTotal", "receitaBruta", "custosFixos", "custosVariaveis", "lucroLiquido", "capitalGiro"].some((field) => isFilled(state.fields[field])),
    hasFinancialTables: Array.from(FINANCIAL_TABLE_IDS).some((tableId) => (state.tables[tableId] || []).some((row) => row.some(isFilled))),
    financialIndicatorsCalculated: indicators.hasEnoughData,
    indicators,
    htmlLength: html.length
  });
  return html;
}

function renderDocumentSwotMatrix() {
  const items = [
    ["Forças", "forcas"],
    ["Fraquezas", "fraquezas"],
    ["Oportunidades", "oportunidades"],
    ["Ameaças", "ameacas"]
  ].filter(([, field]) => isFilled(state.fields[field]));

  if (!items.length) return "";

  return `
    <div class="document-swot-matrix">
      ${items.map(([label, field]) => `
        <div>
          <strong>${label}</strong>
          <p>${formatDocumentValue({ name: field }, state.fields[field])}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDocumentTimelineRoadmap() {
  const rows = (state.tables.cronogramaTable || []).filter((row) => row.some(isFilled));
  if (!rows.length) return "";

  return `
    <div class="document-roadmap">
      ${rows.map((row) => `
        <div class="document-roadmap-item">
          <span>${escapeHtml(formatDate(row[2]) || "Prazo a definir")}</span>
          <strong>${escapeHtml(row[0] || "Atividade")}</strong>
          <p>${escapeHtml([row[1], row[3], row[4]].filter(Boolean).join(" • "))}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDocumentTable(table) {
  const rows = (state.tables[table.id] || []).filter((row) => row.some(isFilled));
  if (!rows.length) return "";
  return `
    <table class="document-table">
      <caption><strong>${table.title}</strong></caption>
      <thead><tr>${table.columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${table.columns.map((_, index) => `<td>${formatDocumentTableCell(table, index, row[index])}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

function formatDocumentTableCell(table, columnIndex, value) {
  if (!isFilled(value)) return "";
  if (table.dateColumn === columnIndex) return escapeHtml(formatDate(value));
  const numericColumns = new Set([table.numericColumn, ...(table.numericColumns || [])].filter((column) => column !== undefined));
  if (numericColumns.has(columnIndex)) return money(value);
  if (/valor|receita|preço|preco/i.test(table.columns[columnIndex])) return money(value);
  return escapeHtml(value);
}

function sanitizeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}

function formatDocumentValue(field, value) {
  if (field.inputType === "date") return escapeHtml(formatDate(value));
  if (MONEY_FIELDS.has(field.name)) return money(value);
  if (field.inputType === "number") return escapeHtml(String(value).replace(".", ","));
  return escapeHtml(value).replace(/\n/g, "<br>");
}
