function updateFinancialCards() {
  collectFields();
  const indicators = calculateFinancialIndicators();
  state.fields.lucroLiquido = indicators.lucroLiquido ? String(indicators.lucroLiquido.toFixed(2)) : state.fields.lucroLiquido || "";
  const lucroField = document.querySelector('[data-field="lucroLiquido"]');
  if (lucroField && document.activeElement !== lucroField) lucroField.value = state.fields.lucroLiquido;

  setText("pontoEquilibrio", indicators.pontoEquilibrio !== null ? money(indicators.pontoEquilibrio) : "Não calculável");
  setText("lucratividade", indicators.receitaTotal > 0 ? percent(indicators.margemLucro) : "Não calculável");
  setText("rentabilidade", indicators.investimentoTotal > 0 ? percent(indicators.rentabilidade) : "Não calculável");
  setText("retorno", indicators.prazoRetornoMeses !== null ? `${indicators.prazoRetornoMeses.toFixed(1).replace(".", ",")} meses` : "Não calculável");
  setText("financeWarning", indicators.hasEnoughData ? "Indicadores atualizados com base nos campos e tabelas preenchidos." : "Preencha receita mensal, custos e investimento inicial para calcular viabilidade.");
  financeDebugLog("updateFinancialCards", indicators);
}

function recalculateFinancialPlan(button) {
  try {
    collectFields();
    updateFinancialCards();
    saveState();
    showNotice("Plano financeiro recalculado com sucesso.", "success");
    buttonFeedback(button, "success", "Recalculado");
    financeDebugLog("recalculateFinancialPlan:success", {
      indicators: calculateFinancialIndicators(),
      stateSummary: summarizeState(state),
      tables: summarizeTables(state.tables)
    });
  } catch (error) {
    showNotice("Não foi possível recalcular o plano financeiro.", "error");
    buttonFeedback(button, "error", "Erro");
    financeDebugLog("recalculateFinancialPlan:error", { message: error.message });
    console.error("[PNKC FINANCE DEBUG]", error);
  }
}

function calculateFinancialIndicators() {
  const receitaTabela = sumReceitasTable();
  const custosFixosTabela = sumTableColumn("custosFixosTable", 1);
  const custosVariaveisTabela = sumCustosVariaveisTable();
  const investimentoTabela = sumInvestimentosTable();
  const capitalGiroTabela = sumTableColumn("capitalGiroTable", 1);

  const receitaTotal = receitaTabela || toNumber(state.fields.receitaBruta) || toNumber(state.fields.faturamentoEsperado);
  const custosFixosTotal = custosFixosTabela || toNumber(state.fields.custosFixos);
  const custosVariaveisTotal = custosVariaveisTabela || toNumber(state.fields.custosVariaveis);
  const investimentoTotal = investimentoTabela || toNumber(state.fields.investimentoTotal) || toNumber(state.fields.capitalInicial);
  const capitalGiro = capitalGiroTabela || toNumber(state.fields.capitalGiro) || toNumber(state.fields.necessidadeCapitalGiro);
  const lucroLiquido = receitaTotal - custosFixosTotal - custosVariaveisTotal;
  const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;
  const margemContribuicaoPercentual = receitaTotal > 0 ? (receitaTotal - custosVariaveisTotal) / receitaTotal : 0;
  const pontoEquilibrio = margemContribuicaoPercentual > 0 ? custosFixosTotal / margemContribuicaoPercentual : null;
  const rentabilidade = investimentoTotal > 0 ? (lucroLiquido / investimentoTotal) * 100 : 0;
  const prazoRetornoMeses = lucroLiquido > 0 && investimentoTotal > 0 ? investimentoTotal / lucroLiquido : null;

  return {
    receitaTotal,
    custosFixosTotal,
    custosVariaveisTotal,
    investimentoTotal,
    capitalGiro,
    lucroLiquido,
    margemLucro,
    margemContribuicaoPercentual,
    pontoEquilibrio,
    rentabilidade,
    prazoRetornoMeses,
    hasEnoughData: receitaTotal > 0 && investimentoTotal > 0 && (custosFixosTotal > 0 || custosVariaveisTotal > 0)
  };
}

function sumTableColumn(tableId, columnIndex) {
  return (state.tables[tableId] || []).reduce((total, row) => total + toNumber(row[columnIndex]), 0);
}

function sumInvestimentosTable() {
  return (state.tables.investimentosTable || []).reduce((total, row) => {
    const explicitTotal = toNumber(row[4]);
    const calculatedTotal = toNumber(row[2]) * toNumber(row[3]);
    return total + (explicitTotal || calculatedTotal);
  }, 0);
}

function sumReceitasTable() {
  return (state.tables.receitasTable || []).reduce((total, row) => {
    const explicitTotal = toNumber(row[3]);
    const calculatedTotal = toNumber(row[1]) * toNumber(row[2]);
    return total + (explicitTotal || calculatedTotal);
  }, 0);
}

function sumCustosVariaveisTable() {
  const receitaTotal = sumReceitasTable() || toNumber(state.fields.receitaBruta) || toNumber(state.fields.faturamentoEsperado);
  return (state.tables.custosVariaveisTable || []).reduce((total, row) => {
    const value = toNumber(row[1]);
    const type = String(row[2] || "").toLowerCase();
    return total + (type.includes("percent") ? (receitaTotal * value) / 100 : value);
  }, 0);
}
