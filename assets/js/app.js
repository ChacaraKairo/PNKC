const STORAGE_KEY = "planopro_business_plan_v2";
const LEGACY_KEY = "plano_negocios_form_v1";

const sections = [
  {
    id: "capa",
    title: "Capa",
    help: "Identifique o plano, a empresa e o responsável. A capa deve deixar claro o nome do negócio, local, ano e posicionamento.",
    fields: [
      { type: "logo", name: "logo", label: "Logo da empresa", help: "Imagem salva apenas neste navegador e incluída no relatório impresso." },
      { name: "nomeEmpresa", label: "Nome do projeto ou empresa", required: true, placeholder: "Ex.: Koru Company" },
      { name: "nomeFantasia", label: "Nome fantasia" },
      { name: "autor", label: "Autor/responsável", required: true },
      { name: "cidadeUf", label: "Cidade/UF", placeholder: "Ex.: São Paulo/SP" },
      { name: "ano", label: "Ano", inputType: "number", placeholder: "2026" },
      { name: "slogan", label: "Slogan ou frase de posicionamento", full: true }
    ]
  },
  {
    id: "resumo",
    title: "Resumo executivo",
    help: "Síntese do plano. Os materiais de referência recomendam preencher por último, reunindo negócio, público, oferta, investimento e indicadores.",
    fields: [
      { name: "resumoNegocio", label: "Descrição curta do negócio", kind: "textarea", required: true, full: true, help: "Explique o que a empresa faz, qual problema resolve e por que a oportunidade existe." },
      { name: "publicoAlvo", label: "Público-alvo principal", kind: "textarea" },
      { name: "produtosServicos", label: "Produtos e serviços ofertados", kind: "textarea" },
      { name: "capitalInicial", label: "Capital inicial estimado", inputType: "number", step: "0.01" },
      { name: "faturamentoEsperado", label: "Expectativa de faturamento mensal", inputType: "number", step: "0.01" },
      { name: "expectativas", label: "Expectativas para o negócio", kind: "textarea", full: true },
      { name: "indicadoresResumo", label: "Principais indicadores de viabilidade", kind: "textarea", full: true, help: "Resuma ponto de equilíbrio, lucratividade, rentabilidade e prazo de retorno quando os números estiverem prontos." }
    ]
  },
  {
    id: "empresa",
    title: "Dados da empresa",
    help: "Reúna dados institucionais, setor de atuação, definição do negócio, missão, visão e valores.",
    fields: [
      { name: "razaoSocial", label: "Razão social" },
      { name: "cnpj", label: "CNPJ" },
      { name: "cnae", label: "CNAE/atividade principal" },
      { name: "porte", label: "Porte", kind: "select", options: ["", "MEI", "ME", "EPP", "Média empresa", "Outro"] },
      { name: "endereco", label: "Endereço ou local de operação", full: true },
      { name: "setor", label: "Setor de atividade", kind: "select", options: ["", "Serviços", "Comércio", "Indústria", "Agropecuária", "Tecnologia", "Outro"] },
      { name: "inicio", label: "Data prevista de início", inputType: "date" },
      { name: "definicaoNegocio", label: "Informações sobre o negócio", kind: "textarea", full: true, help: "Descreva modelo de negócio, fonte de receita, necessidades atendidas e cenário futuro." },
      { name: "missao", label: "Missão", kind: "textarea", full: true, help: "Declare a razão de existir da empresa e o valor entregue ao cliente." },
      { name: "visao", label: "Visão", kind: "textarea", full: true, help: "Onde o negócio quer chegar em médio e longo prazo." },
      { name: "valores", label: "Valores", kind: "textarea", full: true, help: "Princípios que guiam decisões, atendimento e cultura." }
    ]
  },
  {
    id: "socios",
    title: "Dados dos sócios e equipe",
    help: "Mapeie perfil, competências, participação e responsabilidades dos envolvidos.",
    tables: [
      { id: "sociosTable", title: "Sócios e responsáveis", columns: ["Nome", "Formação/experiência", "Responsabilidades", "Participação %", "Contato"] }
    ],
    fields: [
      { name: "equipeAtual", label: "Equipe atual", kind: "textarea", full: true },
      { name: "competenciasCriticas", label: "Competências críticas a desenvolver", kind: "textarea", full: true }
    ]
  },
  {
    id: "juridico",
    title: "Forma jurídica e tributária",
    help: "Defina constituição jurídica, enquadramento tributário, licenças e pontos que exigem validação contábil.",
    fields: [
      { name: "formaJuridica", label: "Forma jurídica", kind: "select", options: ["", "MEI", "Empresário Individual", "SLU", "Sociedade Limitada", "Sociedade Anônima", "Outra"] },
      { name: "tributario", label: "Enquadramento tributário", kind: "select", options: ["", "Simples Nacional", "Lucro Presumido", "Lucro Real", "A definir com contador"] },
      { name: "objetoSocial", label: "Objeto social / atividades", kind: "textarea", full: true },
      { name: "licencas", label: "Licenças, registros e alvarás necessários", kind: "textarea" },
      { name: "riscosLegais", label: "Riscos legais ou tributários", kind: "textarea" }
    ]
  },
  {
    id: "mercado",
    title: "Análise de mercado",
    help: "Investigue clientes, região, concorrentes, fornecedores, tendências e necessidades do mercado.",
    fields: [
      { name: "regiao", label: "Região de atuação" },
      { name: "nicho", label: "Nicho de mercado" },
      { name: "clientes", label: "Características dos clientes", kind: "textarea", full: true, help: "Inclua perfil, localização, hábitos de compra, dores e critérios de decisão." },
      { name: "persona", label: "Persona principal", kind: "textarea", full: true },
      { name: "problemaMercado", label: "Necessidade ou problema do mercado", kind: "textarea", full: true },
      { name: "tendencias", label: "Tendências e cenário futuro", kind: "textarea", full: true }
    ],
    tables: [
      { id: "concorrentesTable", title: "Concorrentes", columns: ["Concorrente", "Pontos fortes", "Pontos fracos", "Como vamos diferenciar"] },
      { id: "fornecedoresTable", title: "Fornecedores e parceiros", columns: ["Fornecedor/parceiro", "Produto/serviço", "Contato", "Importância"] }
    ]
  },
  {
    id: "marketing",
    title: "Proposta de valor, marketing e vendas",
    help: "Estruture posicionamento, canais, preço, promoção e relacionamento com clientes.",
    fields: [
      { name: "propostaValor", label: "Proposta de valor", kind: "textarea", required: true, full: true },
      { name: "posicionamento", label: "Posicionamento", kind: "textarea" },
      { name: "diferencial", label: "Diferencial competitivo", kind: "textarea" },
      { name: "preco", label: "Estratégia de preço", kind: "textarea" },
      { name: "canaisVenda", label: "Canais de venda e distribuição", kind: "textarea", help: "Ex.: site, WhatsApp, marketplace, loja física, representantes, parceiros." },
      { name: "promocao", label: "Promoção e divulgação", kind: "textarea" },
      { name: "jornada", label: "Jornada do cliente", kind: "textarea", full: true }
    ]
  },
  {
    id: "operacional",
    title: "Plano operacional",
    help: "Descreva estrutura necessária, equipe, equipamentos, softwares, processos internos e capacidade de atendimento.",
    fields: [
      { name: "localFuncionamento", label: "Local de funcionamento", kind: "textarea" },
      { name: "estruturaNecessaria", label: "Estrutura necessária", kind: "textarea" },
      { name: "equipamentos", label: "Equipamentos", kind: "textarea" },
      { name: "softwares", label: "Softwares e ferramentas", kind: "textarea" },
      { name: "equipe5anos", label: "Equipe necessária", kind: "textarea" },
      { name: "capacidade", label: "Capacidade produtiva ou de atendimento", kind: "textarea" },
      { name: "processosInternos", label: "Processos internos", kind: "textarea", full: true, help: "Detalhe da captação ao pós-venda: responsáveis, padrões de qualidade, prazos e controles." },
      { name: "processoOperacional", label: "Fluxo operacional principal", kind: "textarea", full: true }
    ]
  },
  {
    id: "financeiro",
    title: "Plano financeiro",
    help: "Informe estimativas para calcular viabilidade. Campos vazios e divisões por zero são tratados automaticamente.",
    layout: "three",
    fields: [
      { name: "investimentoTotal", label: "Investimento inicial total", inputType: "number", step: "0.01", calc: true, required: true },
      { name: "receitaBruta", label: "Receita prevista mensal", inputType: "number", step: "0.01", calc: true, required: true },
      { name: "custosFixos", label: "Custos fixos mensais", inputType: "number", step: "0.01", calc: true },
      { name: "custosVariaveis", label: "Custos variáveis mensais", inputType: "number", step: "0.01", calc: true },
      { name: "lucroLiquido", label: "Lucro líquido mensal", inputType: "number", step: "0.01", calc: true, help: "Receita menos custos, despesas e impostos estimados." },
      { name: "capitalGiro", label: "Capital de giro necessário", inputType: "number", step: "0.01" }
    ],
    finance: true,
    tables: [
      { id: "investimentosTable", title: "Investimentos iniciais", columns: ["Item", "Categoria", "Valor", "Observação"], numericColumn: 2 },
      { id: "custosFixosTable", title: "Detalhamento de custos fixos", columns: ["Item", "Valor mensal", "Observação"], numericColumn: 1 },
      { id: "custosVariaveisTable", title: "Detalhamento de custos variáveis", columns: ["Item", "Valor mensal", "Observação"], numericColumn: 1 },
      { id: "receitasTable", title: "Receitas previstas", columns: ["Produto/serviço", "Quantidade", "Preço médio", "Receita estimada"], numericColumn: 3 }
    ]
  },
  {
    id: "swot",
    title: "Análise SWOT",
    help: "Organize forças, fraquezas, oportunidades e ameaças para orientar decisões estratégicas.",
    fields: [
      { name: "forcas", label: "Forças", kind: "textarea" },
      { name: "fraquezas", label: "Fraquezas", kind: "textarea" },
      { name: "oportunidades", label: "Oportunidades", kind: "textarea" },
      { name: "ameacas", label: "Ameaças", kind: "textarea" },
      { name: "fatoresCriticos", label: "Fatores críticos de sucesso", kind: "textarea", full: true }
    ]
  },
  {
    id: "cronograma",
    title: "Cronograma de metas",
    help: "Transforme o plano em execução com prazos, responsáveis, status e próximos passos.",
    tables: [
      { id: "cronogramaTable", title: "Metas e atividades", columns: ["Meta/atividade", "Responsável", "Prazo", "Status", "Observações"], dateColumn: 2, selectColumn: 3, options: ["Planejado", "Em andamento", "Concluído", "Atrasado"] }
    ],
    fields: [
      { name: "acoesCurtoPrazo", label: "Ações a curto prazo", kind: "textarea", full: true }
    ]
  },
  {
    id: "anexos",
    title: "Anexos e imagens",
    help: "Inclua imagens de apoio, protótipos, fotos, organogramas, canvas ou outros materiais visuais.",
    fields: [
      { type: "attachments", name: "anexos", label: "Subir imagens dos anexos", help: "Use imagens leves para manter o JSON exportado prático." },
      { name: "observacoesFinais", label: "Observações finais", kind: "textarea", full: true }
    ]
  }
];

let state = normalizeState(readStoredState());
let currentStep = 0;
let dirty = false;
let noticeTimer;

const form = document.getElementById("planForm");
const stepList = document.getElementById("stepList");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

function normalizeState(raw) {
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
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || JSON.parse(localStorage.getItem(LEGACY_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(showMessage = false) {
  collectFields();
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  dirty = false;
  updateProgress();
  if (showMessage) showNotice("Rascunho salvo neste navegador.", "success");
}

function collectFields() {
  form.querySelectorAll("[data-field]").forEach((field) => {
    state.fields[field.dataset.field] = field.value;
  });
}

function getField(name) {
  return state.fields[name] || "";
}

function isFilled(value) {
  return String(value || "").trim().length > 0;
}

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function percent(value) {
  if (!Number.isFinite(value)) return "0,00%";
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function renderApp() {
  renderSteps();
  renderForm();
  bindEvents();
  setCurrentStep(findFirstStartedStep());
  updateProgress();
  updateFinancialCards();
}

function renderSteps() {
  stepList.innerHTML = sections.map((section, index) => `
    <button class="step-link" type="button" data-step="${index}">
      <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="step-title">${section.title}</span>
      <span class="step-state">Pendente</span>
    </button>
  `).join("");
}

function renderForm() {
  form.innerHTML = sections.map((section, index) => `
    <section class="form-step" id="${section.id}" data-section="${section.id}" aria-labelledby="${section.id}Title">
      <div class="section-head">
        <div>
          <h3 id="${section.id}Title">${index + 1}. ${section.title}</h3>
          <p>${section.help}</p>
        </div>
        <span class="section-badge">Etapa ${index + 1}/${sections.length}</span>
      </div>
      ${renderFields(section)}
      ${section.finance ? renderFinanceCards() : ""}
      ${(section.tables || []).map(renderTableBlock).join("")}
    </section>
  `).join("");

  sections.forEach((section) => {
    (section.tables || []).forEach((table) => {
      if (!state.tables[table.id]) state.tables[table.id] = [emptyRow(table)];
      if (state.tables[table.id].length === 0) state.tables[table.id].push(emptyRow(table));
      renderTableRows(table);
    });
  });
  renderImages();
  markFilledFields();
}

function renderFields(section) {
  if (!section.fields?.length) return "";
  return `<div class="field-grid ${section.layout === "three" ? "three" : ""}">
    ${section.fields.map(renderField).join("")}
  </div>`;
}

function renderField(field) {
  if (field.type === "logo") {
    return `
      <div class="upload-block">
        <label for="logoInput">${field.label}</label>
        <input id="logoInput" type="file" accept="image/*">
        <p class="help-text">${field.help}</p>
        <div class="logo-preview" id="logoPreview">LOGO</div>
      </div>`;
  }

  if (field.type === "attachments") {
    return `
      <div class="upload-block">
        <label for="attachmentInput">${field.label}</label>
        <input id="attachmentInput" type="file" accept="image/*" multiple>
        <p class="help-text">${field.help}</p>
        <div class="attachments-grid" id="attachmentsGrid"></div>
      </div>`;
  }

  const id = `field-${field.name}`;
  const tag = field.kind === "textarea" ? "textarea" : field.kind === "select" ? "select" : "input";
  const required = field.required ? "required" : "";
  const fieldClass = `field ${field.full ? "full" : ""} ${field.required ? "required" : ""}`;
  const common = `id="${id}" data-field="${field.name}" ${required}`;
  const status = field.required ? `<span class="field-status">Obrigatório</span>` : `<span class="field-status">Opcional</span>`;
  let control = "";

  if (tag === "textarea") {
    control = `<textarea ${common} placeholder="${field.placeholder || ""}">${escapeHtml(getField(field.name))}</textarea>`;
  } else if (tag === "select") {
    control = `<select ${common}>${field.options.map((option) => `<option ${getField(field.name) === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  } else {
    control = `<input ${common} type="${field.inputType || "text"}" step="${field.step || ""}" value="${escapeHtml(getField(field.name))}" placeholder="${field.placeholder || ""}" ${field.calc ? "data-calc" : ""}>`;
  }

  return `
    <div class="${fieldClass}">
      <label for="${id}"><span>${field.label}</span>${status}</label>
      ${control}
      ${field.help ? `<p class="help-text">${field.help}</p>` : ""}
    </div>`;
}

function renderFinanceCards() {
  return `
    <div class="finance-results" aria-label="Indicadores financeiros">
      <div class="finance-card"><strong>Ponto de equilíbrio</strong><span id="pontoEquilibrio">R$ 0,00</span><p>Receita mínima para cobrir custos fixos e variáveis, sem lucro nem prejuízo.</p></div>
      <div class="finance-card"><strong>Lucratividade</strong><span id="lucratividade">0,00%</span><p>Percentual da receita que vira lucro líquido no mês.</p></div>
      <div class="finance-card"><strong>Rentabilidade</strong><span id="rentabilidade">0,00%</span><p>Retorno mensal do lucro líquido sobre o investimento inicial.</p></div>
      <div class="finance-card"><strong>Prazo de retorno</strong><span id="retorno">Indefinido</span><p>Tempo estimado para recuperar o investimento inicial.</p></div>
    </div>`;
}

function renderTableBlock(table) {
  return `
    <div class="table-block">
      <div class="table-head">
        <h4>${table.title}</h4>
        <button class="button ghost" type="button" data-add-row="${table.id}">Adicionar linha</button>
      </div>
      <div class="table-wrap">
        <table id="${table.id}">
          <thead><tr>${table.columns.map((column) => `<th>${column}</th>`).join("")}<th>Ações</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>`;
}

function renderTableRows(table) {
  const tbody = document.querySelector(`#${table.id} tbody`);
  if (!tbody) return;
  tbody.innerHTML = "";
  (state.tables[table.id] || []).forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    table.columns.forEach((column, columnIndex) => {
      const td = document.createElement("td");
      const input = createTableInput(table, rowIndex, columnIndex);
      input.setAttribute("aria-label", `${column} - linha ${rowIndex + 1}`);
      td.appendChild(input);
      tr.appendChild(td);
    });
    const actionTd = document.createElement("td");
    actionTd.innerHTML = `<button class="button danger" type="button" data-remove-row="${table.id}" data-row="${rowIndex}">Remover</button>`;
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

function createTableInput(table, rowIndex, columnIndex) {
  const longColumn = /observa|respons|experi|fortes|fracos|diferenciar/i.test(table.columns[columnIndex]);
  const input = document.createElement(longColumn ? "textarea" : "input");
  input.value = state.tables[table.id][rowIndex][columnIndex] || "";
  input.dataset.table = table.id;
  input.dataset.row = rowIndex;
  input.dataset.column = columnIndex;
  if (table.dateColumn === columnIndex) input.type = "date";
  else if (table.numericColumn === columnIndex) {
    input.type = "number";
    input.step = "0.01";
  } else if (input.tagName === "INPUT") {
    input.type = "text";
  }

  if (table.selectColumn === columnIndex) {
    const select = document.createElement("select");
    select.dataset.table = table.id;
    select.dataset.row = rowIndex;
    select.dataset.column = columnIndex;
    select.setAttribute("aria-label", `${table.columns[columnIndex]} - linha ${rowIndex + 1}`);
    select.innerHTML = ["", ...(table.options || [])].map((option) => `<option ${state.tables[table.id][rowIndex][columnIndex] === option ? "selected" : ""}>${option}</option>`).join("");
    return select;
  }

  return input;
}

function emptyRow(table) {
  return table.columns.map(() => "");
}

function findTableConfig(tableId) {
  for (const section of sections) {
    const table = (section.tables || []).find((item) => item.id === tableId);
    if (table) return table;
  }
  return null;
}

function bindEvents() {
  stepList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step]");
    if (button) setCurrentStep(Number(button.dataset.step));
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
    if (add) addTableRow(add.dataset.addRow);
    if (remove) removeTableRow(remove.dataset.removeRow, Number(remove.dataset.row));
  });

  document.getElementById("nextButton").addEventListener("click", nextStep);
  document.getElementById("bottomNextButton").addEventListener("click", nextStep);
  document.getElementById("prevButton").addEventListener("click", prevStep);
  document.getElementById("bottomPrevButton").addEventListener("click", prevStep);
  document.getElementById("saveButton").addEventListener("click", () => saveState(true));
  document.getElementById("exportButton").addEventListener("click", exportJSON);
  document.getElementById("importFile").addEventListener("change", importJSON);
  document.getElementById("printButton").addEventListener("click", printReport);
  document.getElementById("clearButton").addEventListener("click", clearAll);
  document.getElementById("continueButton").addEventListener("click", () => document.getElementById("workspace").scrollIntoView({ behavior: "smooth" }));
  window.addEventListener("beforeprint", buildPrintReport);

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

function nextStep() {
  const missing = requiredMissingInCurrentStep();
  if (missing.length) {
    showNotice(`Revise os campos obrigatórios desta etapa: ${missing.join(", ")}.`, "error");
    return;
  }
  saveState(true);
  if (currentStep < sections.length - 1) setCurrentStep(currentStep + 1);
  else showNotice("Plano salvo. Você já pode exportar ou imprimir o relatório.", "success");
}

function prevStep() {
  saveState();
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
}

function removeTableRow(tableId, rowIndex) {
  const table = findTableConfig(tableId);
  state.tables[tableId].splice(rowIndex, 1);
  if (state.tables[tableId].length === 0) state.tables[tableId].push(emptyRow(table));
  renderTableRows(table);
  saveState();
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleLogoUpload(file) {
  if (!file) return;
  state.images.logo = await fileToDataURL(file);
  saveState(true);
  renderImages();
}

async function handleAttachments(files, input) {
  for (const file of Array.from(files || [])) {
    state.images.anexos.push(await fileToDataURL(file));
  }
  input.value = "";
  saveState(true);
  renderImages();
}

function renderImages() {
  const logoPreview = document.getElementById("logoPreview");
  if (logoPreview) {
    logoPreview.innerHTML = state.images.logo ? `<img src="${state.images.logo}" alt="Logo da empresa">` : "LOGO";
  }

  const grid = document.getElementById("attachmentsGrid");
  if (!grid) return;
  grid.innerHTML = (state.images.anexos || []).map((image, index) => `
    <article class="attachment-card">
      <div class="attachment-thumb"><img src="${image}" alt="Anexo ${index + 1}"></div>
      <div class="row-actions"><button class="button danger" type="button" data-remove-image="${index}">Remover</button></div>
    </article>
  `).join("");
  grid.querySelectorAll("[data-remove-image]").forEach((button) => {
    button.addEventListener("click", () => {
      state.images.anexos.splice(Number(button.dataset.removeImage), 1);
      saveState();
      renderImages();
    });
  });
}

function updateFinancialCards() {
  collectFields();
  const receita = Number(state.fields.receitaBruta || 0);
  const lucro = Number(state.fields.lucroLiquido || 0);
  const investimento = Number(state.fields.investimentoTotal || 0);
  const fixos = Number(state.fields.custosFixos || 0);
  const variaveis = Number(state.fields.custosVariaveis || 0);
  const margemContribuicao = receita - variaveis;
  const indiceMargem = receita > 0 ? margemContribuicao / receita : 0;
  const ponto = indiceMargem > 0 ? fixos / indiceMargem : 0;
  const lucratividade = receita > 0 ? (lucro / receita) * 100 : 0;
  const rentabilidade = investimento > 0 ? (lucro / investimento) * 100 : 0;
  const retorno = lucro > 0 ? investimento / lucro : 0;

  setText("pontoEquilibrio", indiceMargem > 0 ? money(ponto) : "Indefinido");
  setText("lucratividade", percent(lucratividade));
  setText("rentabilidade", percent(rentabilidade));
  setText("retorno", retorno > 0 && Number.isFinite(retorno) ? `${retorno.toFixed(1).replace(".", ",")} meses` : "Indefinido");
}

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

function exportJSON() {
  saveState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const company = slug(getField("nomeEmpresa") || "plano-de-negocios");
  link.href = url;
  link.download = `${company}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showNotice("Arquivo JSON exportado.", "success");
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(reader.result));
      state.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      dirty = false;
      renderForm();
      setCurrentStep(findFirstStartedStep());
      showNotice("Plano importado com sucesso.", "success");
    } catch {
      showNotice("Arquivo JSON inválido.", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function clearAll() {
  const confirmed = window.confirm("Tem certeza que deseja apagar todos os dados salvos neste navegador?");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  state = normalizeState({});
  renderForm();
  setCurrentStep(0);
  updateProgress();
  showNotice("Dados locais apagados.", "success");
}

function printReport() {
  saveState();
  buildPrintReport();
  window.print();
}

function buildPrintReport() {
  const report = document.getElementById("printReport");
  const company = getField("nomeEmpresa") || "Plano de Negócios";
  const location = getField("cidadeUf");
  const year = getField("ano") || new Date().getFullYear();
  const coverLogo = state.images.logo ? `<img class="print-logo" src="${state.images.logo}" alt="Logo da empresa">` : "";

  report.innerHTML = `
    <div class="print-cover">
      ${coverLogo}
      <h1>${escapeHtml(company)}</h1>
      <p><strong>Plano de Negócios</strong></p>
      <p>${escapeHtml(getField("slogan"))}</p>
      <p>${escapeHtml([location, year].filter(Boolean).join(" - "))}</p>
      <p>Gerado em ${new Date().toLocaleDateString("pt-BR")}</p>
    </div>
    ${sections.map(renderPrintSection).join("")}
  `;
}

function renderPrintSection(section, index) {
  const fields = (section.fields || []).filter((field) => !field.type && isFilled(state.fields[field.name]));
  const tables = (section.tables || []).filter((table) => (state.tables[table.id] || []).some((row) => row.some(isFilled)));
  const hasImages = section.id === "anexos" && state.images.anexos.length;
  if (!fields.length && !tables.length && !hasImages) return "";

  return `
    <section class="print-section">
      <h2>${index + 1}. ${section.title}</h2>
      ${fields.map((field) => `<p class="print-field"><strong>${field.label}</strong>${formatPrintValue(field, state.fields[field.name])}</p>`).join("")}
      ${tables.map(renderPrintTable).join("")}
      ${hasImages ? `<div class="print-attachments">${state.images.anexos.map((image, imageIndex) => `<img src="${image}" alt="Anexo ${imageIndex + 1}">`).join("")}</div>` : ""}
    </section>
  `;
}

function renderPrintTable(table) {
  const rows = (state.tables[table.id] || []).filter((row) => row.some(isFilled));
  if (!rows.length) return "";
  return `
    <table>
      <caption><strong>${table.title}</strong></caption>
      <thead><tr>${table.columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${table.columns.map((_, index) => `<td>${escapeHtml(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

function formatPrintValue(field, value) {
  if (field.inputType === "date") return escapeHtml(formatDate(value));
  if (field.inputType === "number") return escapeHtml(String(value).replace(".", ","));
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function slug(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderApp();
