import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const COMPANY_SITE_URL = "https://korucompany.com.br";

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
const indexPath = resolve("index.html");
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
  await page.goto(pathToFileURL(indexPath).href, { waitUntil: "networkidle0" });

  if (dataPath) {
    if (!existsSync(dataPath)) throw new Error(`Arquivo JSON nao encontrado: ${dataPath}`);
    const json = readFileSync(dataPath, "utf8");
    JSON.parse(json);
    await page.evaluate((payload) => {
      localStorage.setItem("planopro_business_plan_v2", payload);
    }, json);
    await page.reload({ waitUntil: "networkidle0" });
  }

  await page.evaluate(() => {
    document.body.classList.add("puppeteer-pdf-mode");
    window.buildPrintReport();
  });

  await page.waitForFunction(() => document.querySelectorAll(".document-page").length > 0);

  await page.emulateMediaType("print");
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `
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
        <span>Koru Company — Plano de Negócios</span>
        <span>${COMPANY_SITE_URL}</span>
        <span>Documento gerado pelo PNKC · Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
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
