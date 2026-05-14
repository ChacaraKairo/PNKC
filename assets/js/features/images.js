function compressImageFile(file, maxWidth) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Arquivo inválido."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleLogoUpload(file) {
  if (!file) return;
  try {
    state.images.logo = await compressImageFile(file, MAX_LOGO_WIDTH);
    storageMode = "full";
    saveState(true);
    renderImages();
    showNotice("Logo enviada e otimizada com sucesso.", "success");
  } catch {
    showNotice("Não foi possível carregar a logo.", "error");
  }
}

async function handleAttachments(files, input) {
  try {
    for (const file of Array.from(files || [])) {
      state.images.anexos.push(await compressImageFile(file, MAX_ATTACHMENT_WIDTH));
    }
    storageMode = "full";
    input.value = "";
    saveState(true);
    renderImages();
    showNotice("Anexo enviado e otimizado com sucesso.", "success");
  } catch {
    showNotice("Não foi possível carregar o anexo.", "error");
  }
}

function renderImages() {
  pdfDebugLog("renderImages:start", {
    hasLogo: Boolean(state.images.logo),
    attachmentCount: state.images.anexos?.length || 0,
    attachments: (state.images.anexos || []).map((image, index) => ({
      index,
      type: typeof image,
      hasSrc: Boolean(getAttachmentSrc(image)),
      srcLength: getAttachmentSrc(image).length
    }))
  });
  const logoPreview = document.getElementById("logoPreview");
  if (logoPreview) {
    logoPreview.innerHTML = state.images.logo ? `<img src="${state.images.logo}" alt="Logo da empresa">` : "LOGO";
  }

  const grid = document.getElementById("attachmentsGrid");
  if (!grid) return;
  grid.innerHTML = (state.images.anexos || []).map((image, index) => `
    <article class="attachment-card">
      <div class="attachment-thumb"><img src="${getAttachmentSrc(image)}" alt="${escapeHtml(getAttachmentCaption(image, index))}"></div>
      <div class="row-actions"><button class="button danger" type="button" data-remove-image="${index}">Remover</button></div>
    </article>
  `).join("");
  grid.querySelectorAll("[data-remove-image]").forEach((button) => {
    button.addEventListener("click", () => {
      state.images.anexos.splice(Number(button.dataset.removeImage), 1);
      storageMode = "full";
      saveState();
      renderImages();
      showNotice("Imagem removida com sucesso.", "success");
      buttonFeedback(button, "success", "Removido");
    });
  });
}

function getAttachmentSrc(attachment) {
  if (typeof attachment === "string") return attachment;
  return attachment?.src || attachment?.dataUrl || attachment?.url || "";
}

function getAttachmentCaption(attachment, index) {
  if (attachment && typeof attachment === "object") {
    return attachment.caption || attachment.name || attachment.description || `Anexo ${index + 1}`;
  }
  return `Anexo ${index + 1}`;
}
