const COMPANY_PROFILE = {
  name: "Koru Company",
  website: "https://site-koru-company.vercel.app",
  email: "korutecnologia@gmail.com",
  phone: "+5519986011419",
  whatsapp: "+5519986011419",
  instagram: "https://www.instagram.com/koru_company/",
  slogan: "Criamos soluções digitais com clareza, cuidado e propósito.",
  whatsappMessage: "Olá, vim pelo Koru PlanoPro e quero ajuda com meu projeto."
};

const COMPANY_CONTACTS_CONFIG = {
  companyName: COMPANY_PROFILE.name,
  companyWebsiteUrl: COMPANY_PROFILE.website,
  footerDescription: COMPANY_PROFILE.slogan,
  contacts: [
    {
      label: "Site da Koru Company",
      type: "url",
      value: COMPANY_PROFILE.website
    },
    {
      label: "Envie-nos um email",
      type: "email",
      value: COMPANY_PROFILE.email
    },
    {
      label: "Telefone",
      type: "phone",
      value: COMPANY_PROFILE.phone
    },
    {
      label: "WhatsApp",
      type: "whatsapp",
      value: COMPANY_PROFILE.whatsapp
    },
    {
      label: "Instagram",
      type: "url",
      value: COMPANY_PROFILE.instagram
    }
  ]
};

function openCompanyWebsite() {
  redirectToContact({
    type: "url",
    value: COMPANY_PROFILE.website
  });
}

function openCompanyWhatsApp(message = COMPANY_PROFILE.whatsappMessage) {
  redirectToContact({
    type: "whatsapp",
    value: COMPANY_PROFILE.whatsapp,
    message
  });
}

function redirectToContact(contact) {
  const href = buildContactHref(contact);
  if (!href) return;

  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    window.location.href = href;
    return;
  }

  window.open(href, "_blank", "noopener,noreferrer");
}

function buildContactHref(contact) {
  const type = String(contact?.type || "").toLowerCase();
  const value = String(contact?.value || "").trim();
  const message = String(contact?.message || "").trim();

  if (!value) return "";
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (type === "whatsapp") {
    const text = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${value.replace(/\D/g, "")}${text}`;
  }
  return ensureAbsoluteUrl(value);
}

function ensureAbsoluteUrl(value) {
  if (/^(https?:)?\/\//i.test(value)) return value;
  return `https://${value}`;
}

function renderCompanyFooter() {
  const footer = document.querySelector("[data-company-footer]");
  if (!footer) return;

  const contacts = (COMPANY_CONTACTS_CONFIG.contacts || []).filter((contact) => contact?.label && contact?.value);

  footer.innerHTML = `
    <div class="company-footer-inner">
      <div class="company-footer-brand">
        <strong>${escapeContactHtml(COMPANY_CONTACTS_CONFIG.companyName)}</strong>
        <span>${escapeContactHtml(COMPANY_CONTACTS_CONFIG.footerDescription)}</span>
      </div>
      <nav class="company-footer-contacts" aria-label="Contatos da empresa">
        ${contacts.map((contact, index) => `
          <button type="button" data-contact-index="${index}">
            ${escapeContactHtml(contact.label)}
          </button>
        `).join("")}
      </nav>
    </div>
  `;

  footer.querySelectorAll("[data-contact-index]").forEach((button) => {
    button.addEventListener("click", () => {
      redirectToContact(contacts[Number(button.dataset.contactIndex)]);
    });
  });
}

function bindCompanyWebsiteLinks() {
  document.querySelectorAll("[data-company-website-link]").forEach((link) => {
    link.setAttribute("href", COMPANY_PROFILE.website || "#");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openCompanyWebsite();
    });
  });
}

function bindCompanyWhatsAppLinks() {
  document.querySelectorAll("[data-company-whatsapp-link], [data-whatsapp]").forEach((link) => {
    const message = link.dataset.companyWhatsappMessage || link.dataset.whatsapp || COMPANY_PROFILE.whatsappMessage;
    link.setAttribute("href", buildContactHref({
      type: "whatsapp",
      value: COMPANY_PROFILE.whatsapp,
      message
    }));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openCompanyWhatsApp(message);
    });
  });
}

function renderQuickContactActions() {
  if (document.querySelector("[data-floating-whatsapp]")) return;

  const link = document.createElement("a");
  link.className = "floating-whatsapp";
  link.dataset.floatingWhatsapp = "true";
  link.dataset.companyWhatsappLink = "true";
  link.href = buildContactHref({
    type: "whatsapp",
    value: COMPANY_PROFILE.whatsapp,
    message: COMPANY_PROFILE.whatsappMessage
  });
  link.textContent = "Falar com a Koru Company";
  link.setAttribute("aria-label", "Falar com a Koru Company no WhatsApp");
  document.body.appendChild(link);

  const bar = document.createElement("div");
  bar.className = "mobile-cta-bar";
  bar.setAttribute("aria-label", "Ação rápida de atendimento");
  bar.innerHTML = `
    <p>Quer atendimento rápido? Fale com a Koru agora.</p>
    <a
      class="mobile-cta-whatsapp"
      href="${escapeContactHtml(link.href)}"
      data-company-whatsapp-link
      data-company-whatsapp-message="${escapeContactHtml(COMPANY_PROFILE.whatsappMessage)}"
    >
      Chamar no WhatsApp
    </a>
  `;
  document.body.appendChild(bar);
}

function escapeContactHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  renderCompanyFooter();
  renderQuickContactActions();
  bindCompanyWebsiteLinks();
  bindCompanyWhatsAppLinks();
});
