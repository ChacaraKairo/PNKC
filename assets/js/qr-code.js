const QR_MAX_COUNT = 4;

const QR_DEFAULTS = {
  data: "https://site-koru-company.vercel.app",
  count: 1,
  dotsType: "dots",
  cornersType: "square",
  qrColor: "#12343b",
  cornerColor: "#197278",
  backgroundColor: "#ffffff",
  size: 360,
  margin: 10,
  imageSize: 0.26
};

const qrState = {
  image: "",
  codes: []
};

function getQrElements() {
  return {
    preview: document.getElementById("qrCodePreview"),
    status: document.getElementById("qrStatus"),
    count: document.getElementById("qrCount"),
    fields: Array.from(document.querySelectorAll("[data-qr-field]")),
    dataInputs: Array.from(document.querySelectorAll("[data-qr-field] textarea")),
    dotsType: document.getElementById("dotsType"),
    cornersType: document.getElementById("cornersType"),
    qrColor: document.getElementById("qrColor"),
    cornerColor: document.getElementById("cornerColor"),
    backgroundColor: document.getElementById("backgroundColor"),
    size: document.getElementById("qrSize"),
    sizeValue: document.getElementById("qrSizeValue"),
    margin: document.getElementById("qrMargin"),
    marginValue: document.getElementById("qrMarginValue"),
    imageSize: document.getElementById("imageSize"),
    imageSizeValue: document.getElementById("imageSizeValue"),
    imageInput: document.getElementById("qrImage"),
    clearImageButton: document.getElementById("clearImageButton"),
    resetButton: document.getElementById("resetQrButton"),
    downloadZipButton: document.getElementById("downloadZipButton"),
    downloadZipButtonSecondary: document.getElementById("downloadZipButtonSecondary")
  };
}

function getSelectedCount(elements) {
  return Math.min(QR_MAX_COUNT, Math.max(1, Number(elements.count.value) || 1));
}

function getActiveDataItems(elements) {
  return elements.dataInputs
    .slice(0, getSelectedCount(elements))
    .map((input, index) => ({
      index: index + 1,
      data: input.value.trim()
    }))
    .filter((item) => item.data);
}

function buildQrOptions(elements, data) {
  const size = Number(elements.size.value);
  const margin = Number(elements.margin.value);
  const imageSize = Number(elements.imageSize.value) / 100;
  const dotsType = elements.dotsType.value;
  const cornersType = elements.cornersType.value;
  const cornerDotType = cornersType === "dot" ? "dot" : "square";

  return {
    width: size,
    height: size,
    type: "canvas",
    data,
    margin,
    image: qrState.image || undefined,
    qrOptions: {
      errorCorrectionLevel: "H"
    },
    dotsOptions: {
      color: elements.qrColor.value,
      type: dotsType
    },
    cornersSquareOptions: {
      color: elements.cornerColor.value,
      type: cornersType
    },
    cornersDotOptions: {
      color: elements.cornerColor.value,
      type: cornerDotType
    },
    backgroundOptions: {
      color: elements.backgroundColor.value
    },
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize,
      margin: 8
    }
  };
}

function updateRangeLabels(elements) {
  elements.sizeValue.textContent = `${elements.size.value} px`;
  elements.marginValue.textContent = `${elements.margin.value} px`;
  elements.imageSizeValue.textContent = `${elements.imageSize.value}%`;
}

function setStatus(elements, message) {
  elements.status.textContent = message;
}

function updateVisibleFields(elements) {
  const selectedCount = getSelectedCount(elements);

  elements.fields.forEach((field, index) => {
    field.hidden = index >= selectedCount;
  });
}

function clearQrPreview(elements) {
  elements.preview.innerHTML = "";
  qrState.codes = [];
}

function createQrCard(elements, item) {
  const card = document.createElement("article");
  card.className = "qr-code-card";

  const title = document.createElement("p");
  title.textContent = `QR Code ${item.index}`;

  const holder = document.createElement("div");
  holder.className = "qr-code-canvas";

  card.append(title, holder);
  elements.preview.append(card);

  const qrCode = new QRCodeStyling(buildQrOptions(elements, item.data));
  qrCode.append(holder);

  return {
    index: item.index,
    data: item.data,
    qrCode
  };
}

function updateQrCodes(elements) {
  updateRangeLabels(elements);
  updateVisibleFields(elements);

  if (typeof QRCodeStyling === "undefined") return;

  const items = getActiveDataItems(elements);
  clearQrPreview(elements);

  if (!items.length) {
    setStatus(elements, "Preencha pelo menos um campo para gerar o QR Code.");
    return;
  }

  qrState.codes = items.map((item) => createQrCard(elements, item));

  const imageMessage = qrState.image ? " com imagem aplicada" : "";
  setStatus(
    elements,
    `${items.length} QR Code${items.length > 1 ? "s" : ""}${imageMessage}.`
  );
}

function resetQrCode(elements) {
  elements.count.value = String(QR_DEFAULTS.count);
  elements.dataInputs.forEach((input, index) => {
    input.value = index === 0 ? QR_DEFAULTS.data : "";
  });
  elements.dotsType.value = QR_DEFAULTS.dotsType;
  elements.cornersType.value = QR_DEFAULTS.cornersType;
  elements.qrColor.value = QR_DEFAULTS.qrColor;
  elements.cornerColor.value = QR_DEFAULTS.cornerColor;
  elements.backgroundColor.value = QR_DEFAULTS.backgroundColor;
  elements.size.value = String(QR_DEFAULTS.size);
  elements.margin.value = String(QR_DEFAULTS.margin);
  elements.imageSize.value = String(QR_DEFAULTS.imageSize * 100);
  elements.imageInput.value = "";
  qrState.image = "";
  updateQrCodes(elements);
  setStatus(elements, "Configuracao padrao restaurada.");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadZip(elements) {
  if (!qrState.codes.length) {
    setStatus(elements, "Preencha pelo menos um campo antes de baixar o ZIP.");
    return;
  }

  if (typeof JSZip === "undefined") {
    setStatus(elements, "Nao foi possivel carregar o gerador de ZIP.");
    return;
  }

  setStatus(elements, "Gerando ZIP...");

  const zip = new JSZip();

  for (const item of qrState.codes) {
    const blob = await item.qrCode.getRawData("png");
    zip.file(`koru-qrcode-${item.index}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, "koru-qrcodes.zip");
  setStatus(elements, `${qrState.codes.length} QR Code${qrState.codes.length > 1 ? "s" : ""} no ZIP.`);
}

function bindQrEvents(elements) {
  [
    elements.count,
    ...elements.dataInputs,
    elements.dotsType,
    elements.cornersType,
    elements.qrColor,
    elements.cornerColor,
    elements.backgroundColor,
    elements.size,
    elements.margin,
    elements.imageSize
  ].forEach((element) => {
    element.addEventListener("input", () => updateQrCodes(elements));
    element.addEventListener("change", () => updateQrCodes(elements));
  });

  elements.imageInput.addEventListener("change", () => {
    const file = elements.imageInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      qrState.image = String(reader.result || "");
      updateQrCodes(elements);
    });
    reader.readAsDataURL(file);
  });

  elements.clearImageButton.addEventListener("click", () => {
    elements.imageInput.value = "";
    qrState.image = "";
    updateQrCodes(elements);
    setStatus(elements, "Imagem removida.");
  });

  elements.resetButton.addEventListener("click", () => resetQrCode(elements));
  elements.downloadZipButton.addEventListener("click", () => downloadZip(elements));
  elements.downloadZipButtonSecondary.addEventListener("click", () => downloadZip(elements));
}

function initQrCodePage() {
  const elements = getQrElements();
  if (!elements.preview) return;

  if (typeof QRCodeStyling === "undefined") {
    setStatus(elements, "Nao foi possivel carregar o gerador de QR Code.");
    return;
  }

  updateRangeLabels(elements);
  bindQrEvents(elements);
  updateQrCodes(elements);
}

document.addEventListener("DOMContentLoaded", initQrCodePage);
