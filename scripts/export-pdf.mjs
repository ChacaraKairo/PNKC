import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

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
const canvasDataPath = args.canvas ? resolve(String(args.canvas)) : null;
const debug = Boolean(args.debug);
const mode = String(args.mode || "screenshot");
const indexPath = resolve("index.html");
const projectBaseUrl = `${pathToFileURL(resolve(".")).href}/`;
const stylesheetPath = resolve("assets/css/styles.css");
const stylesheetCss = readCssBundle(stylesheetPath).replaceAll("</style", "<\\/style");
const browserExecutablePath = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
].find((candidate) => candidate && existsSync(candidate));

if (!existsSync(indexPath)) {
  throw new Error("index.html nao encontrado. Execute este comando na raiz do projeto.");
}

if (!["screenshot", "browser"].includes(mode)) {
  throw new Error(`Modo de PDF invalido: ${mode}. Use "screenshot" ou "browser".`);
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

  if (canvasDataPath) {
    if (!existsSync(canvasDataPath)) throw new Error(`Arquivo JSON do Canvas nao encontrado: ${canvasDataPath}`);
    const canvasJson = readFileSync(canvasDataPath, "utf8").replace(/^\uFEFF/, "");
    JSON.parse(canvasJson);
    await page.evaluate((payload) => {
      localStorage.setItem("pnkc_canvas_v1", payload);
    }, canvasJson);
    await page.reload({ waitUntil: "networkidle0" });
    if (debug) {
      console.log("[PNKC PDF DEBUG] canvas json", {
        canvasDataPath,
        jsonLength: canvasJson.length
      });
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

  const isolatedPrintHtml = inlineLocalImageSources(await page.evaluate(() => {
    const report = document.querySelector("#printReport");

    if (!report) {
      throw new Error("#printReport nao encontrado para gerar HTML isolado.");
    }

    if (!report.querySelector(".document-page")) {
      throw new Error("#printReport nao contem .document-page no HTML isolado.");
    }

    return report.outerHTML;
  }));

  const isolatedDocumentHtml = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="${projectBaseUrl}">
  <title>PNKC Print Report</title>
  <style>${stylesheetCss}</style>
</head>
<body class="document-preview-active puppeteer-pdf-mode">
  ${isolatedPrintHtml}
  <style>
    body {
      margin: 0;
      background: #f7f3ea;
    }

    body.screenshot-pdf-mode .print-report {
      width: 210mm;
      margin: 0;
      padding: 0;
      background: #f7f3ea;
    }

    body.screenshot-pdf-mode .document-page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      max-width: none;
      margin: 0;
      box-shadow: none;
      transform: none;
      display: flex;
      overflow: hidden;
    }
  </style>
</body>
</html>`;

  const printPage = await browser.newPage();
  await printPage.setViewport({
    width: 1600,
    height: 2200,
    deviceScaleFactor: Number(args.scale || 2)
  });
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
  await printPage.evaluate(() => {
    document.body.classList.add("screenshot-pdf-mode");
    const report = document.querySelector("#printReport");
    if (report) {
      report.style.display = "block";
      report.style.visibility = "visible";
      report.style.opacity = "1";
    }
    document.querySelectorAll("#printReport .document-page").forEach((page) => {
      page.style.transform = "none";
      page.style.display = "flex";
      page.style.width = "210mm";
      page.style.height = "297mm";
      page.style.minHeight = "297mm";
      page.style.maxHeight = "297mm";
      page.style.overflow = "hidden";
    });
  });
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

  await printPage.emulateMediaType("screen");

  const styleDiagnostics = await printPage.evaluate(() => {
    const report = document.querySelector("#printReport");
    const firstPage = document.querySelector("#printReport .document-page");
    const firstBody = document.querySelector("#printReport .document-body");
    const firstSection = document.querySelector("#printReport .document-section");
    const financialSection = Array.from(document.querySelectorAll("#printReport .document-section"))
      .find((section) => section.textContent.includes("Plano financeiro"));
    const visibleContentBlocks = document.querySelectorAll(
      "#printReport .document-field, #printReport .document-finance-dashboard, #printReport .document-swot-matrix, #printReport .document-roadmap, #printReport .document-table, #printReport .document-summary li, #printReport .document-cover h1, #printReport .document-closing h2, #printReport .document-image-frame img, #printReport .document-canvas-board"
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

  if (mode === "browser") {
    await printPage.emulateMediaType("print");
    await printPage.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
      }
    });
    console.log(`PDF gerado pelo navegador em: ${outPath}`);
  } else {
  const screenshotPaths = await captureReportPageScreenshots(printPage, outPath);
  if (!screenshotPaths.length) {
    throw new Error("Nenhuma pagina visual foi capturada para montar o PDF.");
  }

  const pdfDocument = await PDFDocument.create();
  for (const screenshotPath of screenshotPaths) {
    const image = await pdfDocument.embedPng(readFileSync(screenshotPath));
    const pdfPage = pdfDocument.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: A4_WIDTH_PT,
      height: A4_HEIGHT_PT
    });
  }

  const pdfBytes = await pdfDocument.save();
  writeFileSync(outPath, pdfBytes);

  console.log("[PNKC PDF DEBUG] screenshot PDF", {
    pageCount: screenshotPaths.length,
    outputBytes: pdfBytes.length
  });

  console.log(`PDF gerado por screenshots em: ${outPath}`);
  }
} finally {
  await browser.close();
}

async function captureReportPageScreenshots(page, outputPath) {
  const pageCount = await page.evaluate(() => document.querySelectorAll("#printReport .document-page").length);
  const screenshotsDir = resolve(dirname(outputPath), "pdf-pages");
  const screenshotPaths = [];
  mkdirSync(screenshotsDir, { recursive: true });

  for (let index = 0; index < pageCount; index += 1) {
    const element = await page.$(`#printReport .document-page:nth-of-type(${index + 1})`);
    if (!element) {
      throw new Error(`Pagina visual ${index + 1} nao encontrada para screenshot.`);
    }

    const box = await element.boundingBox();
    if (!box || box.width <= 0 || box.height <= 0) {
      throw new Error(`Pagina ${index + 1} sem dimensoes validas para screenshot.`);
    }

    const screenshotPath = resolve(screenshotsDir, `page-${String(index + 1).padStart(3, "0")}.png`);
    await element.screenshot({ path: screenshotPath });
    screenshotPaths.push(screenshotPath);
  }

  return screenshotPaths;
}

function readCssBundle(filePath, seen = new Set()) {
  const resolvedPath = resolve(filePath);
  if (seen.has(resolvedPath)) return "";
  seen.add(resolvedPath);

  const css = readFileSync(resolvedPath, "utf8");
  const cssDirectory = dirname(resolvedPath);
  return css
    .replace(/@import\s+url\(["']?(.+?)["']?\);/g, (_match, importPath) => {
      return readCssBundle(resolve(cssDirectory, importPath), seen);
    })
    .replace(/url\(["']?(.+?)["']?\)/g, (match, assetPath) => {
      if (/^(data:|https?:|file:|#)/i.test(assetPath)) return match;
      const dataUrl = fileToDataUrl(resolve(cssDirectory, assetPath));
      return dataUrl ? `url("${dataUrl}")` : match;
    });
}

function inlineLocalImageSources(html) {
  return html.replace(/\ssrc=(["'])(.+?)\1/g, (match, quote, source) => {
    if (/^(data:|https?:|blob:)/i.test(source)) return match;

    const sourcePath = source.startsWith("file:")
      ? new URL(source)
      : resolve(source.replace(/^\/+/, ""));
    const resolvedPath = sourcePath instanceof URL ? sourcePath : resolve(sourcePath);
    if (!existsSync(resolvedPath)) return match;

    const dataUrl = fileToDataUrl(resolvedPath);
    return dataUrl ? ` src=${quote}${dataUrl}${quote}` : match;
  });
}

function fileToDataUrl(filePath) {
  if (!existsSync(filePath)) return "";

  const extension = String(filePath).split(".").pop()?.toLowerCase();
  const mimeType = extension === "svg"
    ? "image/svg+xml"
    : extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : extension === "gif"
          ? "image/gif"
          : "image/jpeg";
  const data = readFileSync(filePath).toString("base64");
  return `data:${mimeType};base64,${data}`;
}
