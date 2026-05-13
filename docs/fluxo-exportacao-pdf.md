# Fluxo de exportacao PDF

O PNKC usa uma separacao clara entre a tela de edicao e o documento final.

## Camadas

- **Tela de edicao**: `index.html`, formulario e controles da aplicacao.
- **Estado do plano**: objeto `state` em `assets/js/app.js`, salvo em `localStorage`.
- **Documento HTML final**: gerado por `createBusinessPlanDocumentHtml()`.
- **Pre-visualizacao/print**: `window.buildPrintReport()` injeta o HTML final em `#printReport`.
- **PDF via Puppeteer**: `scripts/export-pdf.mjs` abre o site, chama `window.buildPrintReport()` e gera o PDF.

## Funcoes principais

- `buildPrintReport()`: mantida como API publica para o navegador e para o Puppeteer.
- `createBusinessPlanDocumentHtml()`: monta a versao final do documento.
- `renderDocumentPage()`: cria paginas A4 com cabecalho, corpo, rodape e marca d'agua.
- `renderDocumentImagePages()`: cria uma pagina por imagem/anexo.

## Correcao do problema de PDF vazio

O PDF podia sair vazio quando o Puppeteer chamava `page.pdf()` antes de o HTML final estar totalmente montado, ou quando `#printReport` ainda nao tinha paginas do documento.

Agora o fluxo e explicito:

1. `window.buildPrintReport()` limpa e monta `#printReport`.
2. O relatorio recebe `data-ready="false"` enquanto esta sendo preparado.
3. O codigo valida se existem paginas `.document-page` e conteudo real.
4. Todas as imagens dentro de `#printReport` sao aguardadas.
5. Apenas no fim `#printReport` recebe `data-ready="true"`.
6. O Puppeteer espera `#printReport[data-ready="true"]` antes de gerar o PDF.

Se `#printReport` nao tiver `.document-page`, o exportador interrompe o processo com erro claro. Isso evita criar um arquivo PDF aparentemente valido, mas sem conteudo.

## Modo debug

Use:

```powershell
npm run export:pdf -- --data plano-de-negocios.json --out dist/plano-pnkc.pdf --debug
```

Com `--debug`, o exportador:

- abre `index.html?debugPdf=1`;
- captura `console.log`, `console.warn`, `console.error`, `pageerror`, `requestfailed` e respostas HTTP 400+;
- loga leitura do JSON, gravacao no `localStorage`, reload e estatisticas do relatorio;
- executa `window.inspectPrintReport(#printReport)`;
- salva `dist/debug-print-report.html`;
- salva `dist/debug-print-report.png`;
- imprime diagnosticos de CSS, incluindo `display`, altura e existencia da secao financeira.

No navegador, os logs aparecem com os prefixos:

- `[PNKC PDF DEBUG]`
- `[PNKC FINANCE DEBUG]`

Para diagnosticar PDF vazio, confira nesta ordem:

1. O JSON tem `fields` e `tables` preenchidos.
2. O `localStorage` manteve o JSON depois do reload.
3. `collectFields()` nao substituiu dados carregados por campos vazios.
4. `createBusinessPlanDocumentHtml()` recebeu dados com campos preenchidos.
5. `#printReport` possui `.document-page`, `.document-field` ou `.document-table`.
6. `getRealReportText(#printReport)` tem conteudo real, nao apenas cabecalho, rodape e marca d'agua.
7. O diagnostico de CSS mostra `#printReport` e `.document-page` visiveis.

## Diagnostico do financeiro

O link `#financeiro` do menu superior e interceptado pela aplicacao. Ele chama `goToSection("financeiro")`, troca a etapa ativa para **Plano financeiro** e rola para o formulario.

Se o clique nao funcionar, ative `?debugPdf=1` e procure logs `[PNKC FINANCE DEBUG]` com:

- elemento clicado;
- `href`;
- `dataset`;
- indice da secao financeira;
- `currentStep` antes e depois;
- existencia dos cards financeiros.

## Classes do documento

- `.document-page`
- `.document-cover`
- `.document-summary`
- `.document-section`
- `.document-footer`
- `.document-image-page`
- `.document-table`

## Rodape

Na pre-visualizacao HTML, cada pagina possui `.document-footer`.

No Puppeteer, `document.body.classList.add("puppeteer-pdf-mode")` oculta o rodape HTML interno. O rodape numerado passa a ser criado por `footerTemplate`, com:

- `Koru Company — Plano de Negocios`
- `https://korucompany.com.br`
- `Documento gerado pelo PNKC · Pagina X de Y`

## Imagens/anexos

Cada imagem ocupa uma pagina propria em `.document-image-page`.

As imagens ficam dentro de uma `figure.document-image-frame`, com:

- orientacao retrato;
- centralizacao vertical e horizontal;
- `object-fit: contain`;
- quebra antes e depois.

Nao existe grade de anexos no PDF: uma imagem nunca divide pagina com outra imagem.

## Boas praticas

- Evitar `position: fixed` dentro do documento final.
- Usar `break-inside: avoid` apenas em blocos pequenos, cards e linhas de tabela.
- Permitir que tabelas e textos longos quebrem quando necessario.
- Manter `thead { display: table-header-group; }` para repetir cabecalhos de tabela quando o navegador suportar.
