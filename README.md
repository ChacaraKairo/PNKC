# PlanoPro - Montador de Plano de Negocios

Aplicacao web estatica para criar, preencher, salvar, exportar e imprimir planos de negocios completos. O projeto funciona apenas no navegador, sem backend obrigatorio, e foi organizado para publicacao em GitHub Pages, Netlify ou Vercel.

## Funcionalidades

- Pagina inicial profissional.
- Formulario dividido por etapas.
- Barra de progresso baseada no preenchimento real.
- Salvamento automatico no navegador com `localStorage`.
- Continuacao do rascunho ao reabrir o site.
- Upload de logo e imagens/anexos.
- Exportacao e importacao em JSON.
- Relatorio profissional para impressao ou PDF.
- Calculos financeiros:
  - Ponto de equilibrio.
  - Lucratividade.
  - Rentabilidade.
  - Prazo de retorno do investimento.
- Validacoes amigaveis.
- Layout responsivo para desktop, tablet e celular.
- Acessibilidade basica com labels, foco visivel, contraste e navegacao por teclado.

## Como executar localmente

O site nao exige instalacao de dependencias.

Abra diretamente:

```text
index.html
```

Ou rode um servidor estatico:

```powershell
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Como gerar PDF profissional

O botao **Imprimir/PDF** monta primeiro uma versao HTML limpa do documento e depois abre a impressao. Essa versao nao reutiliza a tela de edicao; ela e construida por uma camada propria de documento em `assets/js/app.js`.

Para gerar um PDF final sem URL local, sem data/horario automaticos do navegador, com rodape institucional e numeracao de paginas, use o exportador Puppeteer:

```powershell
npm install
npm run export:pdf -- --out dist/plano-pnkc.pdf
```

Para gerar o PDF a partir de um JSON exportado pelo sistema:

```powershell
npm run export:pdf -- --data plano-de-negocios.json --out dist/plano-pnkc.pdf
```

Esse modo usa `displayHeaderFooter: true`, `footerTemplate`, `printBackground: true` e o HTML final de impressao em A4. Ele nao imprime a URL `localhost`.

O site da empresa no rodape fica centralizado na constante:

```js
const COMPANY_SITE_URL = "https://korucompany.com.br";
```

Ela existe em `assets/js/app.js` para a pre-visualizacao HTML e em `scripts/export-pdf.mjs` para o rodape numerado do Puppeteer.

## Fluxo HTML -> PDF

1. O usuario edita normalmente o formulario.
2. Ao imprimir/exportar, `window.buildPrintReport()` chama `createBusinessPlanDocumentHtml()`.
3. Essa funcao monta o documento final com classes `document-*`.
4. O navegador imprime essa versao HTML, ou o Puppeteer gera PDF a partir dela.
5. No Puppeteer, o rodape HTML interno e ocultado e o `footerTemplate` adiciona site, texto institucional e `Pagina X de Y`.

Mais detalhes em [`docs/fluxo-exportacao-pdf.md`](docs/fluxo-exportacao-pdf.md).

## Estrutura do projeto

```text
.
├── index.html
├── site-plano-de-negocios.html
├── README.md
├── .editorconfig
├── .gitattributes
├── .gitignore
├── assets
│   ├── css
│   │   └── styles.css
│   ├── img
│   │   └── hero.jpg
│   ├── js
│   │   └── app.js
│   └── favicon.svg
└── docs
    ├── README.md
    ├── media
    │   └── imagem-original.jpg
    └── references
        └── PDFs de apoio
```

## Pastas principais

- `index.html`: entrada principal do site.
- `site-plano-de-negocios.html`: arquivo legado mantido para compatibilidade, redirecionando para `index.html`.
- `assets/css`: estilos da aplicacao.
- `assets/js`: logica de formulario, salvamento, calculos, importacao/exportacao e impressao.
- `assets/img`: imagens usadas pela interface publicada.
- `docs/references`: PDFs usados como referencia de conteudo.
- `docs/media`: arquivos de midia originais ou materiais que nao precisam ser carregados diretamente pelo site.

## Como publicar no GitHub Pages

1. Envie o projeto para um repositorio GitHub.
2. Acesse **Settings > Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch principal.
5. Escolha a pasta raiz (`/root`).
6. Salve e aguarde a URL publicada.

## Como publicar na Netlify

1. Entre na Netlify.
2. Escolha **Add new site > Deploy manually**.
3. Arraste a pasta do projeto.
4. Nao informe comando de build.
5. Use a raiz do projeto como pasta de publicacao.

## Como publicar na Vercel

1. Importe o repositorio na Vercel.
2. Framework preset: **Other**.
3. Build command: deixe vazio.
4. Output directory: deixe vazio ou use `.`.
5. Publique.

## Proximas melhorias

- Mascaras para CNPJ, telefone e moeda.
- Exportacao em `.docx`.
- Graficos financeiros.
- Projecoes mensais.
- Backend opcional para contas de usuario e sincronizacao em nuvem.
