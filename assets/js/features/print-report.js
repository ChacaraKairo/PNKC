const DOCUMENT_CANVAS_STORAGE_KEY = "pnkc_canvas_v1";
const DOCUMENT_CANVAS_NOTE_MAX_LENGTH = 280;
const REPORT_CANVAS_SECTIONS = [
  ["parceriasChave", "Parcerias-Chave"],
  ["atividadesChave", "Atividades-Chave"],
  ["recursosChave", "Recursos-Chave"],
  ["propostaValor", "Proposta de Valor"],
  ["relacionamentoClientes", "Relacionamento"],
  ["canais", "Canais"],
  ["segmentosClientes", "Segmentos de Clientes"],
  ["estruturaCustos", "Estrutura de Custos"],
  ["fontesReceita", "Fontes de Receita"]
];

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

  const contentPages = Array.from(report.querySelectorAll(".document-page"));
  const contentBodies = Array.from(report.querySelectorAll(".document-body"));
  const bodyTextLength = contentBodies
    .map((body) => body.textContent.trim())
    .join("")
    .length;
  const visibleContentBlocks = report.querySelectorAll(
    ".document-field, .document-finance-dashboard, .document-swot-matrix, .document-roadmap, .document-table, .document-summary li, .document-cover h1, .document-closing h2, .document-image-frame img, .document-canvas-board"
  ).length;

  pdfDebugLog("buildPrintReport:content-validation", {
    pageCount: contentPages.length,
    bodyTextLength,
    visibleContentBlocks,
    pageBodies: contentBodies.map((body, index) => ({
      index,
      textLength: body.textContent.trim().length,
      htmlLength: body.innerHTML.trim().length,
      firstText: body.textContent.trim().slice(0, 120)
    }))
  });

  pdfDebugLog("buildPrintReport:dom-inserted", inspectPrintReport(report));
  if (!contentPages.length || !contentBodies.length || (!bodyTextLength && !visibleContentBlocks)) {
    report.dataset.ready = "false";
    throw new Error("Relatorio de impressao vazio. Nenhum conteudo real foi gerado em .document-body.");
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
    ${renderCanvasReportPage()}
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
    <section class="document-page pdf-page ${pageClass}${hideChrome}">
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
  const tables = (section.tables || []).filter((table) => shouldPrintTable(section, table));
  const specialBlocks = renderSpecialPrintBlocks(section);
  if (!fields.length && !tables.length && !specialBlocks.length) {
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

  const fieldBlocks = fields.flatMap(renderDocumentFieldBlocks);
  const contentBlocks = [
    ...specialBlocks,
    ...fieldBlocks,
    ...tables.flatMap(renderDocumentTableBlocks)
  ];
  const chunks = chunkDocumentSectionBlocks(contentBlocks);
  const sectionHtml = chunks.map((chunk, chunkIndex) => renderDocumentSectionPage(section, index, chunk.map((block) => block.html).join(""), chunkIndex, chunks.length)).join("");
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

function renderDocumentSectionPage(section, index, content, chunkIndex = 0, chunkCount = 1) {
  const continuation = chunkCount > 1 ? `<small>Parte ${chunkIndex + 1} de ${chunkCount}</small>` : "";

  return renderDocumentPage(`
    <article class="document-section">
      <div class="document-section-title">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h2>${section.title}</h2>
        ${continuation}
      </div>
      ${content}
    </article>
  `, { pageClass: "document-content-page" });
}

function chunkDocumentSectionBlocks(blocks) {
  const chunks = [];
  let current = [];
  let currentUnits = 0;
  const maxUnits = 2800;

  blocks.forEach((block) => {
    const units = block.units || estimatePrintUnits(block.html);
    const shouldStartNewChunk = current.length && (
      block.forceAlone ||
      currentUnits + units > maxUnits ||
      (block.isTable && currentUnits > 1300)
    );

    if (shouldStartNewChunk) {
      chunks.push(current);
      current = [];
      currentUnits = 0;
    }

    current.push(block);
    currentUnits += units;

    if (block.forceAlone || units >= maxUnits) {
      chunks.push(current);
      current = [];
      currentUnits = 0;
    }
  });

  if (current.length) chunks.push(current);
  return chunks.length ? chunks : [[]];
}

function renderDocumentFieldBlocks(field) {
  const rawValue = normalizeFieldValueByLimit(field.name, state.fields[field.name]);
  const chunks = splitTextForPrint(rawValue, field.kind === "textarea" ? 780 : 420);

  return chunks.map((chunk, index) => ({
    html: `
      <div class="document-field pdf-card pdf-break-avoid">
        <strong>${escapeHtml(field.label)}${chunks.length > 1 ? ` <span>parte ${index + 1}/${chunks.length}</span>` : ""}</strong>
        <p>${formatDocumentValue(field, chunk)}</p>
      </div>
    `,
    units: 260 + chunk.length,
    forceAlone: chunk.length > 1050
  }));
}

function splitTextForPrint(value, maxLength = 780) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text ? [text] : [];

  const chunks = [];
  const paragraphs = text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  let current = "";

  paragraphs.forEach((paragraph) => {
    if (paragraph.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      splitLongParagraph(paragraph, maxLength).forEach((part) => chunks.push(part));
      return;
    }

    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > maxLength && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

function splitLongParagraph(paragraph, maxLength) {
  const sentences = paragraph.match(/[^.!?]+[.!?]+|\S.+$/g) || [paragraph];
  const chunks = [];
  let current = "";

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    const next = current ? `${current} ${trimmed}` : trimmed;

    if (next.length > maxLength && current) {
      chunks.push(current);
      current = trimmed;
      return;
    }

    if (trimmed.length > maxLength) {
      chunks.push(...trimmed.match(new RegExp(`.{1,${maxLength}}(\\s|$)`, "g")).map((part) => part.trim()).filter(Boolean));
      current = "";
      return;
    }

    current = next;
  });

  if (current) chunks.push(current);
  return chunks;
}

function estimatePrintUnits(html) {
  const markup = String(html || "");
  const text = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const rows = (markup.match(/<tr/g) || []).length;
  const cards = (markup.match(/document-card-list-item/g) || []).length;
  return text.length + rows * 180 + cards * 260;
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

function readCanvasStateForReport() {
  try {
    const stored = localStorage.getItem(DOCUMENT_CANVAS_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const hasNotes = Object.values(parsed?.sections || {}).some((notes) =>
      Array.isArray(notes) && notes.some((note) => note?.text?.trim())
    );

    return hasNotes ? parsed : null;
  } catch {
    return null;
  }
}

function renderCanvasReportPage() {
  const canvas = readCanvasStateForReport();
  if (!canvas) return "";

  const company = getField("nomeEmpresa") || getField("nomeFantasia") || "Plano de Negocios";
  const companyLogo = state.images.logo || "";

  return renderDocumentPage(`
    <article class="document-canvas-page-content">
      <div class="document-canvas-header">
        <div>
          <p class="document-kicker">Business Model Canvas</p>
          <h2>${escapeHtml(company)}</h2>
          <span>Modelo de negocio visual</span>
        </div>
        ${companyLogo ? `<img src="${companyLogo}" alt="Logo da empresa">` : ""}
      </div>

      <div class="document-canvas-board">
        ${REPORT_CANVAS_SECTIONS.map(([sectionId, title]) => {
          const notes = Array.isArray(canvas.sections?.[sectionId])
            ? canvas.sections[sectionId].filter((note) => note?.text?.trim())
            : [];

          return `
            <section class="document-canvas-cell" data-section-id="${sectionId}">
              <h3>${escapeHtml(title)}</h3>
              <div>
                ${notes.length
                  ? notes.map((note) => `<p class="document-canvas-note">${escapeHtml(limitCanvasReportNoteText(note.text))}</p>`).join("")
                  : `<p class="document-canvas-empty">Sem notas</p>`
                }
              </div>
            </section>
          `;
        }).join("")}
      </div>
    </article>
  `, { pageClass: "document-canvas-page" });
}

function limitCanvasReportNoteText(value) {
  return String(value || "").trim().slice(0, DOCUMENT_CANVAS_NOTE_MAX_LENGTH).trim();
}

function shouldPrintField(section, field) {
  if (field.type || HIDDEN_PRINT_FIELDS.has(field.name) || !isFilled(state.fields[field.name])) return false;
  if (section.id === "swot" && ["forcas", "fraquezas", "oportunidades", "ameacas"].includes(field.name)) return false;
  if (section.id === "financeiro") return false;
  return true;
}

function shouldPrintTable(section, table) {
  if (section.id === "cronograma" && table.id === "cronogramaTable") return false;
  return (state.tables[table.id] || []).some((row) => row.some(isFilled));
}

function renderSpecialPrintBlocks(section) {
  if (section.id === "financeiro") {
    return [{
      html: renderDocumentFinancialDashboard(),
      units: 1250,
      forceAlone: false
    }];
  }

  if (section.id === "swot") return renderDocumentSwotBlocks();
  if (section.id === "cronograma") return renderDocumentTimelineBlocks();
  return [];
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
    ${renderDocumentFinancialSummary()}
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

function renderDocumentFinancialSummary() {
  const items = [
    ["Investimento inicial total", "investimentoTotal", "money"],
    ["Receita prevista mensal", "receitaBruta", "money"],
    ["Custos fixos mensais", "custosFixos", "money"],
    ["Custos variáveis mensais", "custosVariaveis", "money"],
    ["Lucro líquido mensal", "lucroLiquido", "money"],
    ["Capital de giro necessário", "capitalGiro", "money"],
    ["Reserva mínima", "reservaMinima", "money"],
    ["Prazo médio de recebimento", "prazoRecebimento", "days"],
    ["Prazo médio de pagamento", "prazoPagamento", "days"],
    ["Estoque inicial", "estoqueInicial", "money"],
    ["Necessidade estimada de capital de giro", "necessidadeCapitalGiro", "money"]
  ].filter(([, field]) => isFilled(state.fields[field]));

  if (!items.length) return "";

  return `
    <div class="document-finance-summary pdf-card pdf-break-avoid">
      ${items.map(([label, field, type]) => `
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${type === "money" ? money(state.fields[field]) : `${formatPlainNumber(state.fields[field])} dias`}</strong>
        </div>
      `).join("")}
    </div>
  `;
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

function renderDocumentSwotBlocks() {
  const items = [
    ["Forças", "forcas"],
    ["Fraquezas", "fraquezas"],
    ["Oportunidades", "oportunidades"],
    ["Ameaças", "ameacas"]
  ].filter(([, field]) => isFilled(state.fields[field]));

  return items.flatMap(([label, field]) => {
    const chunks = splitTextForPrint(state.fields[field], 680);

    return chunks.map((chunk, index) => ({
      html: `
        <div class="document-swot-card pdf-card pdf-break-avoid">
          <strong>${escapeHtml(label)}${chunks.length > 1 ? ` <span>parte ${index + 1}/${chunks.length}</span>` : ""}</strong>
          <p>${formatDocumentValue({ name: field }, chunk)}</p>
        </div>
      `,
      units: 320 + chunk.length,
      forceAlone: false
    }));
  });
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

function renderDocumentTimelineBlocks() {
  const rows = (state.tables.cronogramaTable || []).filter((row) => row.some(isFilled));
  if (!rows.length) return [];

  return rows.map((row, index) => {
    const details = [row[1], row[3], row[4]].filter(Boolean).join(" • ");
    const chunks = splitTextForPrint(details, 520);
    const suffix = chunks.length > 1 ? ` - parte 1/${chunks.length}` : "";
    const firstBlock = {
      html: renderDocumentTimelineItem(row, chunks[0] || "", suffix),
      units: 420 + String(row[0] || "").length + String(chunks[0] || "").length,
      forceAlone: false
    };

    if (chunks.length <= 1) return firstBlock;

    return [
      firstBlock,
      ...chunks.slice(1).map((chunk, chunkIndex) => ({
        html: renderDocumentTimelineItem(row, chunk, ` - parte ${chunkIndex + 2}/${chunks.length}`, true),
        units: 360 + chunk.length,
        forceAlone: false
      }))
    ];
  }).flat();
}

function renderDocumentTimelineItem(row, details, suffix = "", isContinuation = false) {
  return `
    <div class="document-roadmap-item pdf-card pdf-break-avoid">
      <span>${escapeHtml(formatDate(row[2]) || "Prazo a definir")}${escapeHtml(suffix)}</span>
      <strong>${escapeHtml(isContinuation ? `${row[0] || "Atividade"} (continuação)` : row[0] || "Atividade")}</strong>
      <p>${escapeHtml(details)}</p>
    </div>
  `;
}

function renderDocumentTableBlocks(table) {
  if (table.id === "sociosTable") return renderDocumentCardTableBlocks(table);
  if (table.id === "projecaoMensalTable") {
    const rows = (state.tables[table.id] || []).filter((row) => row.some(isFilled));
    return chunkArray(rows, 6).map((rowChunk, index) => renderDocumentTableBlock(table, rowChunk, {
      titleSuffix: rows.length > 6 ? ` - meses ${index * 6 + 1} a ${index * 6 + rowChunk.length}` : "",
      compact: true,
      units: 980 + rowChunk.length * 170
    })).filter(Boolean);
  }

  const rows = (state.tables[table.id] || []).filter((row) => row.some(isFilled));
  if (!rows.length) return "";
  return [renderDocumentTableBlock(table, rows)].filter(Boolean);
}

function renderDocumentTableBlock(table, rows, options = {}) {
  if (!rows.length) return null;
  const compactClass = options.compact || FINANCIAL_TABLE_IDS.has(table.id) ? " document-table-compact pdf-table-compact" : "";
  const colgroup = renderDocumentTableColgroup(table);
  const title = `${table.title}${options.titleSuffix || ""}`;
  const html = `
    <div class="document-table-block pdf-break-avoid">
    <table class="document-table pdf-table${compactClass}" data-table-id="${table.id}">
      <caption><strong>${escapeHtml(title)}</strong></caption>
      ${colgroup}
      <thead><tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${table.columns.map((_, index) => `<td>${formatDocumentTableCell(table, index, row[index])}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    </div>
  `;

  return {
    html,
    units: options.units || 720 + rows.length * table.columns.length * 80,
    isTable: true,
    forceAlone: rows.length > 8 && table.columns.length > 4
  };
}

function renderLegacyDocumentTable(table) {
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

function renderDocumentCardTableBlocks(table) {
  const rows = (state.tables[table.id] || []).filter((row) => row.some(isFilled));
  if (!rows.length) return [];

  const cards = rows.map((row) => `
    <article class="document-card-list-item pdf-card pdf-break-avoid">
      ${table.columns.map((column, index) => isFilled(row[index]) ? `
        <div>
          <strong>${escapeHtml(column)}</strong>
          <p>${formatDocumentTableCell(table, index, row[index])}</p>
        </div>
      ` : "").join("")}
    </article>
  `);

  return chunkArray(cards, 2).map((chunk, index) => ({
    html: `
      <section class="document-card-list">
        <h3>${escapeHtml(table.title)}${cards.length > 2 ? ` - grupo ${index + 1}` : ""}</h3>
        ${chunk.join("")}
      </section>
    `,
    units: 520 + chunk.join("").replace(/<[^>]+>/g, " ").length,
    isTable: true
  }));
}

function renderDocumentTableColgroup(table) {
  const widths = {
    concorrentesTable: [20, 26, 26, 28],
    fornecedoresTable: [26, 28, 22, 24],
    investimentosTable: [25, 16, 11, 14, 14, 20],
    receitasTable: [30, 14, 17, 17, 22],
    custosFixosTable: [30, 18, 20, 32],
    custosVariaveisTable: [34, 22, 16, 28],
    capitalGiroTable: [30, 16, 22, 32],
    projecaoMensalTable: [14, 17, 17, 18, 17, 17],
    cronogramaTable: [30, 20, 15, 15, 20]
  }[table.id];

  if (!widths) return "";
  return `<colgroup>${widths.map((width) => `<col style="width:${width}%">`).join("")}</colgroup>`;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function formatDocumentTableCell(table, columnIndex, value) {
  if (!isFilled(value)) return "";
  if (table.dateColumn === columnIndex) return escapeHtml(formatDate(value));
  const format = getDocumentTableColumnFormat(table, columnIndex, value);
  if (format === "money") return money(value);
  if (format === "percent") return formatPercentCell(value);
  if (format === "number") return escapeHtml(formatPlainNumber(value));
  return escapeHtml(value);
}

function getDocumentTableColumnFormat(table, columnIndex, value = "") {
  const column = String(table.columns[columnIndex] || "").toLowerCase();
  const normalizedColumn = column.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const numericColumns = new Set([table.numericColumn, ...(table.numericColumns || [])].filter((column) => column !== undefined));

  if (table.id === "custosVariaveisTable" && columnIndex === 1) {
    const row = (state.tables[table.id] || []).find((item) => item[columnIndex] === value);
    return String(row?.[2] || "").toLowerCase().includes("percent") ? "percent" : "money";
  }
  if (/participacao|percentual/.test(normalizedColumn)) return "percent";
  if (/quantidade|prazo|dias/.test(normalizedColumn)) return "number";
  if (/valor|receita|preco|custo|lucro|saldo|investimento|capital|reserva|estoque/.test(normalizedColumn)) return "money";
  return numericColumns.has(columnIndex) ? "number" : "text";
}

function formatPlainNumber(value) {
  const number = toNumber(value);
  if (!Number.isFinite(number)) return String(value || "");
  return Number.isInteger(number)
    ? String(number)
    : number.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function formatPercentCell(value) {
  const raw = String(value || "").trim();
  if (raw.includes("%")) return escapeHtml(raw);
  const number = toNumber(value);
  if (!Number.isFinite(number)) return escapeHtml(raw);
  return `${number.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
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

function formatLimitedDocumentTableCell(table, columnIndex, value) {
  if (!isFilled(value)) return "";
  const normalizedValue = normalizeTableCellValueByLimit(table, columnIndex, value);
  if (table.dateColumn === columnIndex) return escapeHtml(formatDate(normalizedValue));
  const format = getDocumentTableColumnFormat(table, columnIndex, normalizedValue);
  if (format === "money") return money(normalizedValue);
  if (format === "percent") return formatPercentCell(normalizedValue);
  if (format === "number") return escapeHtml(formatPlainNumber(normalizedValue));
  return escapeHtml(normalizedValue);
}

function formatLimitedDocumentValue(field, value) {
  const normalizedValue = normalizeFieldValueByLimit(field.name, value);
  if (field.inputType === "date") return escapeHtml(formatDate(normalizedValue));
  if (MONEY_FIELDS.has(field.name)) return money(normalizedValue);
  if (field.inputType === "number") return escapeHtml(String(normalizedValue).replace(".", ","));
  return escapeHtml(normalizedValue).replace(/\n/g, "<br>");
}

formatDocumentTableCell = formatLimitedDocumentTableCell;
formatDocumentValue = formatLimitedDocumentValue;
