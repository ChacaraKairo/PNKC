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
      if (!state.tables[table.id]) state.tables[table.id] = table.defaultRows ? table.defaultRows.map((row) => [...row]) : [emptyRow(table)];
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
    const value = getField(field.name) || field.defaultValue || "";
    control = `<input ${common} type="${field.inputType || "text"}" step="${field.step || ""}" value="${escapeHtml(value)}" placeholder="${field.placeholder || ""}" ${field.calc ? "data-calc" : ""}>`;
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
    <div class="finance-intro">
      <div>
        <h4>Resumo financeiro</h4>
        <p>Use os campos e tabelas abaixo para estimar investimento, receitas, custos, capital de giro e viabilidade mensal.</p>
      </div>
      <button class="button primary" type="button" id="recalculateFinanceButton">Recalcular plano financeiro</button>
    </div>
    <div class="finance-results" aria-label="Indicadores financeiros">
      <div class="finance-card"><strong>Ponto de equilíbrio</strong><span id="pontoEquilibrio">R$ 0,00</span><p>Receita mínima para cobrir custos fixos e variáveis, sem lucro nem prejuízo.</p></div>
      <div class="finance-card"><strong>Lucratividade</strong><span id="lucratividade">0,00%</span><p>Percentual da receita que vira lucro líquido no mês.</p></div>
      <div class="finance-card"><strong>Rentabilidade</strong><span id="rentabilidade">0,00%</span><p>Retorno mensal do lucro líquido sobre o investimento inicial.</p></div>
      <div class="finance-card"><strong>Prazo de retorno</strong><span id="retorno">Indefinido</span><p>Tempo estimado para recuperar o investimento inicial.</p></div>
    </div>
    <p class="finance-warning" id="financeWarning">Preencha receita mensal, custos e investimento inicial para calcular viabilidade.</p>`;
}

function renderTableBlock(table) {
  return `
    <div class="table-block">
      <div class="table-head">
        <h4>${table.title}</h4>
        <button class="button ghost" type="button" data-add-row="${table.id}">Adicionar linha</button>
      </div>
      ${table.help ? `<p class="table-help">${table.help}</p>` : ""}
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
  const numericColumns = new Set([table.numericColumn, ...(table.numericColumns || [])].filter((column) => column !== undefined));
  if (table.dateColumn === columnIndex) input.type = "date";
  else if (numericColumns.has(columnIndex)) {
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
