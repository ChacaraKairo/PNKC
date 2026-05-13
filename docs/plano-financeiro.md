# Plano financeiro

O plano financeiro do PNKC ajuda a transformar premissas do negocio em indicadores simples de viabilidade. Ele continua funcionando no navegador, sem backend.

## Onde preencher

A etapa **Plano financeiro** contem:

- campos principais de investimento, receita, custos, lucro e capital de giro;
- cards de indicadores;
- botao **Recalcular plano financeiro**;
- tabela de investimentos iniciais;
- tabela de receitas previstas;
- tabela de custos fixos;
- tabela de custos variaveis;
- tabela de capital de giro;
- projecao mensal simples de 12 meses.

O link **Financeiro** no menu superior chama `goToSection("financeiro")`, ativa a etapa correta e rola para o formulario.

## Fontes dos calculos

O sistema usa primeiro as tabelas preenchidas. Se uma tabela estiver vazia, usa os campos principais da etapa.

- `receitaTotal`: soma da tabela `receitasTable` ou campo `receitaBruta`.
- `custosFixosTotal`: soma da tabela `custosFixosTable` ou campo `custosFixos`.
- `custosVariaveisTotal`: soma da tabela `custosVariaveisTable` ou campo `custosVariaveis`.
- `investimentoTotal`: soma da tabela `investimentosTable` ou campo `investimentoTotal`.
- `capitalGiro`: soma da tabela `capitalGiroTable` ou campos `capitalGiro` / `necessidadeCapitalGiro`.

## Formulas

```text
lucroLiquido = receitaTotal - custosFixosTotal - custosVariaveisTotal

margemLucro = receitaTotal > 0
  ? lucroLiquido / receitaTotal * 100
  : 0

margemContribuicaoPercentual = receitaTotal > 0
  ? (receitaTotal - custosVariaveisTotal) / receitaTotal
  : 0

pontoEquilibrio = margemContribuicaoPercentual > 0
  ? custosFixosTotal / margemContribuicaoPercentual
  : null

rentabilidade = investimentoTotal > 0
  ? lucroLiquido / investimentoTotal * 100
  : 0

prazoRetornoMeses = lucroLiquido > 0 && investimentoTotal > 0
  ? investimentoTotal / lucroLiquido
  : null
```

Quando nao houver dados suficientes, a interface mostra **Nao calculavel**.

## Persistencia

Os campos financeiros ficam em `state.fields`. As tabelas ficam em `state.tables`. Por isso:

- o autosave preserva os dados no `localStorage`;
- exportar JSON preserva o plano financeiro;
- importar JSON restaura campos, tabelas e indicadores;
- o PDF usa os mesmos dados do formulario.

## PDF

No HTML final, a secao **Plano financeiro** inclui:

- resumo financeiro;
- indicadores;
- interpretacao curta;
- tabelas financeiras preenchidas.

O modo debug registra `renderFinancialSection`, informando se havia campos financeiros, tabelas financeiras e indicadores calculados.

## Limitacoes

- Os calculos sao estimativas gerenciais, nao substituem analise contabil.
- Impostos, taxas, comissoes e sazonalidade ainda devem ser detalhados manualmente.
- A projecao mensal e uma tabela simples; graficos e fluxo de caixa avancado ficam para melhorias futuras.
