const STORAGE_KEY = "planopro_business_plan_v2";
const LEGACY_KEY = "plano_negocios_form_v1";
const MAX_LOGO_WIDTH = 900;
const MAX_ATTACHMENT_WIDTH = 1400;
const IMAGE_QUALITY = 0.78;
const KORU_LOGO_SRC = "assets/img/koru-company.jpg";
const COMPANY_SITE_URL = "https://korucompany.com.br";
const PDF_DEBUG = false;
const CRITICAL_FIELDS = [
  "nomeEmpresa",
  "autor",
  "resumoNegocio",
  "publicoAlvo",
  "propostaValor",
  "investimentoTotal",
  "receitaBruta",
  "custosFixos",
  "custosVariaveis",
  "lucroLiquido",
  "capitalGiro"
];
const FINANCIAL_TABLE_IDS = new Set([
  "investimentosTable",
  "receitasTable",
  "custosFixosTable",
  "custosVariaveisTable",
  "capitalGiroTable",
  "projecaoMensalTable"
]);
const HIDDEN_PRINT_FIELDS = new Set(["reportPrimaryColor", "reportAccentColor"]);
const MONEY_FIELDS = new Set([
  "capitalInicial",
  "faturamentoEsperado",
  "investimentoTotal",
  "receitaBruta",
  "custosFixos",
  "custosVariaveis",
  "lucroLiquido",
  "capitalGiro",
  "reservaMinima",
  "estoqueInicial",
  "necessidadeCapitalGiro"
]);
const PDF_TITLE = "Plano de Negócios — Koru Company";
let storageMode = "full";
let lastQuotaNoticeAt = 0;
