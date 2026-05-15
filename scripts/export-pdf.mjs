import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const COMPANY_SITE_URL = "https://korucompany.com.br";
const PDF_FOOTER_TEMPLATE = `
  <style>
    .pnkc-footer {
      width: 100%;
      margin: 0 12mm;
      padding-top: 4px;
      border-top: 1px solid #d8c9ad;
      color: #5f5649;
      font-family: Arial, sans-serif;
      font-size: 8px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 8px;
    }

    .pnkc-footer span:nth-child(2) {
      text-align: center;
    }

    .pnkc-footer span:last-child {
      text-align: right;
    }
  </style>
  <div class="pnkc-footer">
    <span>Koru Company &mdash; Plano de Neg&oacute;cios</span>
    <span>${COMPANY_SITE_URL}</span>
    <span>Documento gerado pelo PNKC &middot; P&aacute;gina <span class="pageNumber"></span> de <span class="totalPages"></span></span>
  </div>
`;

const args = {};
const cli = process.argv.slice(2);

for (let index = 0; index < cli.length; index += 1) {
  const arg = cli[index];
  if (!arg.startsWith("--")) continue;
  const key = arg.slice(2);
  const next = cli[index + 1];
  args[key] = next && !next.startsWith("--") ? next : true;
  if (args[key] === next) index += 1;
}

const outPath = resolve(String(args.out || "dist/plano-pnkc.pdf"));
const dataPath = args.data ? resolve(String(args.data)) : null;
const debug = Boolean(args.debug);
const indexPath = resolve("index.html");
const projectBaseUrl = `${pathToFileURL(resolve(".")).href}/`;
const stylesheetUrl = pathToFileURL(resolve("assets/css/styles.css")).href;
const browserExecutablePath = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
].find((candidate) => candidate && existsSync(candidate));

if (!existsSync(indexPath)) {
  throw new Error("index.html nao encontrado. Execute este comando na raiz do projeto.");
}

mkdirSync(dirname(outPath), { recursive: true });

const browser = await puppeteer.launch({
  headless: "new",
  ...(browserExecutablePath ? { executablePath: browserExecutablePath } : {})
});

try {
  const page = await browser.newPage();
  page.on("console", async (msg) => {
    if (!debug && !msg.text().includes("PNKC")) return;
    const values = await Promise.all(msg.args().map(async (arg) => {
      try {
        return await arg.jsonValue();
      } catch {
        return String(arg);
      }
    }));
    console.log(`[BROWSER:${msg.type()}] ${msg.text()}`, values);
  });

  page.on("pageerror", (error) => {
    console.error("[BROWSER:pageerror]", error);
  });

  page.on("requestfailed", (request) => {
    console.warn("[BROWSER:requestfailed]", request.url(), request.failure()?.errorText);
  });

  page.on("response", (response) => {
    if (debug && response.status() >= 400) {
      console.warn("[BROWSER:bad-response]", response.status(), response.url());
    }
  });

  const indexUrl = `${pathToFileURL(indexPath).href}${debug ? "?debugPdf=1" : ""}`;
  if (debug) console.log("[PNKC PDF DEBUG] opening", indexUrl);
  await page.goto(indexUrl, { waitUntil: "networkidle0" });

  if (dataPath) {
    if (!existsSync(dataPath)) throw new Error(`Arquivo JSON nao encontrado: ${dataPath}`);
    const json = readFileSync(dataPath, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(json);
    if (debug) {
      console.log("[PNKC PDF DEBUG] data json", {
        dataPath,
        jsonLength: json.length,
        topLevelKeys: Object.keys(parsed || {}),
        fieldCount: Object.keys(parsed?.fields || {}).length,
        tableKeys: Object.keys(parsed?.tables || {}),
        attachmentCount: parsed?.images?.anexos?.length || 0
      });
    }
    await page.evaluate((payload) => {
      localStorage.setItem("planopro_business_plan_v2", payload);
    }, json);
    if (debug) {
      const storedSize = await page.evaluate(() => localStorage.getItem("planopro_business_plan_v2")?.length || 0);
      console.log("[PNKC PDF DEBUG] localStorage after insert", { storedSize });
    }
    await page.reload({ waitUntil: "networkidle0" });
    if (debug) {
      const storedSizeAfterReload = await page.evaluate(() => localStorage.getItem("planopro_business_plan_v2")?.length || 0);
      console.log("[PNKC PDF DEBUG] localStorage after reload", { storedSizeAfterReload });
    }
  }

  await page.evaluate(async () => {
    document.body.classList.add("document-preview-active", "puppeteer-pdf-mode");
    if (typeof window.buildPrintReport !== "function") {
      throw new Error("window.buildPrintReport() nao esta disponivel.");
    }

    const reportReady = await window.buildPrintReport();
    if (!reportReady) {
      throw new Error("buildPrintReport() nao confirmou a preparacao do relatorio.");
    }
  });

  await page.waitForFunction(() => document.querySelector("#printReport")?.dataset.ready === "true", { timeout: 30000 });

  const reportStats = await page.evaluate(() => {
    const report = document.querySelector("#printReport");
    return window.inspectPrintReport
      ? window.inspectPrintReport(report)
      : {
      pages: document.querySelectorAll("#printReport .document-page").length,
      textLength: report?.textContent?.trim().length || 0,
      imageCount: document.querySelectorAll("#printReport img").length
    };
  });
  console.log("[PNKC PDF DEBUG] reportStats before PDF", reportStats);

  const pageCount = reportStats.pageCount ?? reportStats.pages ?? 0;
  if (!pageCount || (reportStats.hasOnlyChromeText && !reportStats.imageCount)) {
    throw new Error("Relatorio vazio: #printReport nao contem paginas document-page preenchidas.");
  }

  const isolatedPrintHtml = await page.evaluate(() => {
    const report = document.querySelector("#printReport");

    if (!report) {
      throw new Error("#printReport nao encontrado para gerar HTML isolado.");
    }

    if (!report.querySelector(".document-page")) {
      throw new Error("#printReport nao contem .document-page no HTML isolado.");
    }

    return report.outerHTML;
  });

  const isolatedDocumentHtml = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="${projectBaseUrl}">
  <title>PNKC Print Report</title>
  <link rel="stylesheet" href="${stylesheetUrl}">
</head>
<body class="document-preview-active puppeteer-pdf-mode">
  ${isolatedPrintHtml}
</body>
</html>`;

  const printPage = await browser.newPage();
  printPage.on("console", async (msg) => {
    if (!debug && !msg.text().includes("PNKC")) return;
    const values = await Promise.all(msg.args().map(async (arg) => {
      try {
        return await arg.jsonValue();
      } catch {
        return String(arg);
      }
    }));
    console.log(`[PRINT:${msg.type()}] ${msg.text()}`, values);
  });

  printPage.on("pageerror", (error) => {
    console.error("[PRINT:pageerror]", error);
  });

  printPage.on("requestfailed", (request) => {
    console.warn("[PRINT:requestfailed]", request.url(), request.failure()?.errorText);
  });

  await printPage.setContent(isolatedDocumentHtml, { waitUntil: "networkidle0" });
  await printPage.waitForSelector("#printReport .document-page", { timeout: 30000 });

  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll("#printReport img"));
    await Promise.all(images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
  });

  await printPage.evaluate(async () => {
    const images = Array.from(document.querySelectorAll("#printReport img"));
    await Promise.all(images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
  });

  await printPage.emulateMediaType("print");

  const styleDiagnostics = await printPage.evaluate(() => {
    const report = document.querySelector("#printReport");
    const firstPage = document.querySelector("#printReport .document-page");
    const firstBody = document.querySelector("#printReport .document-body");
    const firstSection = document.querySelector("#printReport .document-section");
    const financialSection = Array.from(document.querySelectorAll("#printReport .document-section"))
      .find((section) => section.textContent.includes("Plano financeiro"));
    const visibleContentBlocks = document.querySelectorAll(
      "#printReport .document-field, #printReport .document-finance-dashboard, #printReport .document-swot-matrix, #printReport .document-roadmap, #printReport .document-table, #printReport .document-summary li, #printReport .document-cover h1, #printReport .document-closing h2, #printReport .document-image-frame img"
    ).length;

    return {
      reportDisplay: report ? getComputedStyle(report).display : null,
      reportVisibility: report ? getComputedStyle(report).visibility : null,
      reportHeight: report ? report.getBoundingClientRect().height : null,
      firstPageDisplay: firstPage ? getComputedStyle(firstPage).display : null,
      firstPageHeight: firstPage ? firstPage.getBoundingClientRect().height : null,
      firstBodyDisplay: firstBody ? getComputedStyle(firstBody).display : null,
      firstBodyVisibility: firstBody ? getComputedStyle(firstBody).visibility : null,
      firstBodyHeight: firstBody ? firstBody.getBoundingClientRect().height : null,
      firstBodyTextLength: firstBody ? firstBody.textContent.trim().length : 0,
      firstSectionDisplay: firstSection ? getComputedStyle(firstSection).display : null,
      firstSectionHeight: firstSection ? firstSection.getBoundingClientRect().height : null,
      firstSectionTextLength: firstSection ? firstSection.textContent.trim().length : 0,
      visibleContentBlocks,
      financialSectionExists: Boolean(financialSection),
      financialSectionDisplay: financialSection ? getComputedStyle(financialSection).display : null,
      financialSectionHeight: financialSection ? financialSection.getBoundingClientRect().height : null,
      financialSectionTextLength: financialSection ? financialSection.textContent.trim().length : 0,
      financialSectionVisibleInPrint: Boolean(financialSection) && getComputedStyle(financialSection).display !== "none" && getComputedStyle(financialSection).visibility !== "hidden" && financialSection.textContent.trim().length > 0
    };
  });
  console.log("[PNKC PDF DEBUG] styleDiagnostics", styleDiagnostics);

  if (
    styleDiagnostics.reportDisplay === "none" ||
    styleDiagnostics.reportVisibility === "hidden" ||
    !styleDiagnostics.reportHeight ||
    styleDiagnostics.firstPageDisplay === "none" ||
    !styleDiagnostics.firstPageHeight ||
    styleDiagnostics.firstBodyDisplay === "none" ||
    styleDiagnostics.firstBodyVisibility === "hidden" ||
    !styleDiagnostics.firstBodyHeight ||
    !styleDiagnostics.visibleContentBlocks
  ) {
    throw new Error("HTML isolado do relatorio nao tem miolo visivel para impressao.");
  }

  if (debug) {
    const debugHtmlPath = resolve(dirname(outPath), "debug-print-report.html");
    const debugScreenshotPath = resolve(dirname(outPath), "debug-print-report.png");
    writeFileSync(debugHtmlPath, isolatedDocumentHtml, "utf8");
    await printPage.screenshot({ path: debugScreenshotPath, fullPage: true });
    console.log("[PNKC PDF DEBUG] debug artifacts", { debugHtmlPath, debugScreenshotPath });
  }

  await printPage.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: PDF_FOOTER_TEMPLATE,
    preferCSSPageSize: true,
    margin: {
      top: "0",
      right: "0",
      bottom: "12mm",
      left: "0"
    }
  });

  console.log(`PDF gerado em: ${outPath}`);
} finally {
  await browser.close();
}
