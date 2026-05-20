const COMPANY_CONTACTS_CONFIG = {
  companyName: "Koru Company",
  companyWebsiteUrl: "https://www.seusiteempresarial.com.br",
  footerDescription: "servimos como gostariamos de sermos servidos",
  contacts: [
    {
      label: "Koru company WebSite",
      type: "url",
      value: "https://site-koru-company.vercel.app"
    },
    {
      label: "Envie-nos um email",
      type: "email",
      value: "korutecnologia@gmail.com"
    },
    {
      label: "Telefone",
      type: "phone",
      value: "+5519986011419"
    },
    {
      label: "WhatsApp",
      type: "whatsapp",
      value: "+5519986011419"
    },
    {
      label: "Instagram",
      type: "url",
      value: "https://www.instagram.com/koru_company/"
    }
  ]
};

function openCompanyWebsite() {
  redirectToContact({
    type: "url",
    value: COMPANY_CONTACTS_CONFIG.companyWebsiteUrl
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

  if (!value) return "";
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (type === "whatsapp") return `https://wa.me/${value.replace(/\D/g, "")}`;
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
    link.setAttribute("href", COMPANY_CONTACTS_CONFIG.companyWebsiteUrl || "#");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openCompanyWebsite();
    });
  });
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
  bindCompanyWebsiteLinks();
  renderCompanyFooter();
});
