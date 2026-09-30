// ---------------------------------------------------------------------------
// Idioma
// ---------------------------------------------------------------------------
const LANGS = ["pt", "en"];
let lang = detectLang();

function detectLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem("lang");
    if (LANGS.includes(saved)) return saved;
  } catch {}
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

const t = (key) => STRINGS[lang][key] ?? key;
const pick = (value) => (typeof value === "object" ? value[lang] : value);

function applyStrings() {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      el.setAttribute(attr, t(key));
    });
  });
  document.querySelectorAll(".lang [data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });
}

function setLang(next) {
  lang = next;
  try { localStorage.setItem("lang", next); } catch {}
  const url = new URL(location.href);
  url.searchParams.set("lang", next);
  history.replaceState(null, "", url);
  render();
}

document.querySelectorAll(".lang [data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

document.querySelectorAll("[data-playlist]").forEach((a) => { a.href = PLAYLIST_URL; });

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", t(open ? "nav.close" : "nav.open"));
  menu.hidden = !open;
}

toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("click", (e) => {
  if (!menu.hidden && !e.target.closest(".nav")) setMenu(false);
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------------------------------------------------------------------------
// Experiência: timelines dos cards + pop-up com acordeão
// ---------------------------------------------------------------------------
const CHEVRON = '<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z"/></svg>';

function renderTimelines() {
  document.querySelectorAll("[data-timeline]").forEach((list) => {
    list.innerHTML = EXPERIENCES[list.dataset.timeline]
      .filter((item) => item.inCard !== false)
      .map((item) => `<li class="${item.past ? "is-past" : ""}"><strong>${pick(item.title)}</strong><span>${pick(item.meta)}</span></li>`)
      .join("");
  });
}

const expModal = document.getElementById("exp-modal");
const expList = document.getElementById("exp-list");
let expKind = "technical";

function renderExpModal() {
  expModal.querySelector("#exp-modal-tag span").textContent = t(`exp.${expKind}`);
  expModal.querySelector("#exp-modal-tag img").src =
    expKind === "academic" ? "assets/icons/graduation-cap-sm.svg" : "assets/icons/briefcase.svg";
  expList.innerHTML = EXPERIENCES[expKind]
    .map((item, i) => `
      <li class="accordion__item${i === 0 ? " is-open" : ""}">
        <button type="button" class="accordion__head" aria-expanded="${i === 0}" aria-controls="exp-desc-${i}">
          <span class="accordion__title"><strong>${pick(item.title)}</strong><span>${pick(item.meta)}</span></span>
          <span class="accordion__chevron">${CHEVRON}</span>
        </button>
        <div class="accordion__panel" id="exp-desc-${i}" ${i === 0 ? "" : "hidden"}><p>${pick(item.desc)}</p></div>
      </li>`)
    .join("");
}

expList.addEventListener("click", (e) => {
  const head = e.target.closest(".accordion__head");
  if (!head) return;
  const item = head.parentElement;
  const open = !item.classList.contains("is-open");
  item.classList.toggle("is-open", open);
  head.setAttribute("aria-expanded", String(open));
  item.querySelector(".accordion__panel").hidden = !open;
});

document.querySelectorAll("[data-exp]").forEach((card) => {
  const open = () => {
    expKind = card.dataset.exp;
    renderExpModal();
    openModal(expModal);
  };
  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
});

// ---------------------------------------------------------------------------
// Linhas de pesquisa
// ---------------------------------------------------------------------------
const tabList = document.querySelector(".segmented");
const researchTitle = document.getElementById("research-title");
const researchText = document.getElementById("research-text");
let areaIndex = 0;

function renderResearch() {
  tabList.innerHTML = AREAS.map((_, i) =>
    `<button type="button" role="tab" aria-selected="${i === areaIndex}">${t("research.area")} ${String(i + 1).padStart(2, "0")}</button>`
  ).join("");
  researchTitle.textContent = pick(AREAS[areaIndex].title);
  researchText.innerHTML = pick(AREAS[areaIndex].text);
}

tabList.addEventListener("click", (e) => {
  const tab = e.target.closest("[role=tab]");
  if (!tab) return;
  areaIndex = [...tabList.children].indexOf(tab);
  renderResearch();
  tabList.children[areaIndex].focus();
});

tabList.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  areaIndex = (areaIndex + (e.key === "ArrowRight" ? 1 : -1) + AREAS.length) % AREAS.length;
  renderResearch();
  tabList.children[areaIndex].focus();
});

// ---------------------------------------------------------------------------
// Artigos e publicações (modal)
// ---------------------------------------------------------------------------
const PUBS_LIMIT = 4;
const pubsModal = document.getElementById("pubs-modal");
const pubsBody = document.getElementById("pubs-body");
const filterBtn = document.getElementById("pubs-filter-btn");
const filterMenu = document.getElementById("pubs-filter-menu");
const expanded = new Set();
let yearFilter = "all";
// Preenchido por data/publications.json (gerado por scripts/fetch_publications.py)
let publications = null;
let pubsError = false;

// Os dados vêm de fontes externas: sempre escapar antes de inserir no HTML
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");

const PUB_GROUPS = ["journals", "conferences", "preprints", "datasets"];

function pubCard(p, group) {
  const url = safeUrl(p.url);
  const label = t(group === "datasets" ? "pubs.full.data" : "pubs.full");
  return `
    <article class="pub">
      ${p.venue ? `<p class="pub__meta" title="${esc(p.venue)}">${esc(p.venue)}</p>` : ""}
      <h5 class="pub__title" title="${esc(p.title)}">${esc(p.title)}</h5>
      ${url ? `<a class="pub__link" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>` : ""}
    </article>`;
}

// Agrupa os itens visíveis por ano (mais recente primeiro)
function byYear(items, group) {
  const years = [...new Set(items.map((p) => p.year || 0))].sort((a, b) => b - a);
  return years.map((y) => `
    <div class="pubs__year">
      <h4>${y || "—"}</h4>
      <div class="pubs__grid">${items.filter((p) => (p.year || 0) === y).map((p) => pubCard(p, group)).join("")}</div>
    </div>`).join("");
}

async function loadPubs() {
  try {
    const res = await fetch("data/publications.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    publications = await res.json();
  } catch {
    pubsError = true;
  }
  renderPubs();
}

function renderPubs() {
  if (!publications) {
    pubsBody.innerHTML = `<p class="pubs__empty">${t(pubsError ? "pubs.error" : "pubs.loading")}</p>`;
    filterMenu.innerHTML = "";
    return;
  }
  const groups = Object.fromEntries(PUB_GROUPS.map((g) => [g, publications[g] || []]));
  const updated = publications.updated
    ? `<p class="pubs__updated">${t("pubs.updated").replace("{date}", new Date(publications.updated + "T12:00:00").toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "2-digit", month: "short", year: "numeric" }))}</p>`
    : "";
  const sections = Object.entries(groups).map(([group, items]) => {
    const filtered = items.filter((p) => yearFilter === "all" || p.year === yearFilter);
    if (!filtered.length) return "";
    const isOpen = expanded.has(group);
    const visible = isOpen ? filtered : filtered.slice(0, PUBS_LIMIT);
    const more = filtered.length > PUBS_LIMIT
      ? `<button type="button" class="pubs__more" data-group="${group}">${isOpen ? t("pubs.less") : `${t("pubs.more")} (${filtered.length - PUBS_LIMIT})`}</button>`
      : "";
    return `<section class="pubs__section"><h3>${t(`pubs.${group}`)}</h3>${byYear(visible, group)}${more}</section>`;
  }).join("");
  pubsBody.innerHTML = (sections || `<p class="pubs__empty">${t("pubs.empty")}</p>`) + updated;

  const years = [...new Set(Object.values(groups).flat().map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);
  filterMenu.innerHTML = ["all", ...years].map((y) =>
    `<button type="button" data-year="${y}" aria-pressed="${y === yearFilter}">${y === "all" ? t("pubs.all") : y}</button>`
  ).join("");
  filterBtn.classList.toggle("is-active", yearFilter !== "all");
}

pubsBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".pubs__more");
  if (!btn) return;
  const group = btn.dataset.group;
  expanded.has(group) ? expanded.delete(group) : expanded.add(group);
  renderPubs();
});

function setFilterMenu(open) {
  filterMenu.hidden = !open;
  filterBtn.setAttribute("aria-expanded", String(open));
}

filterBtn.addEventListener("click", () => setFilterMenu(filterMenu.hidden));
filterMenu.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-year]");
  if (!btn) return;
  yearFilter = btn.dataset.year === "all" ? "all" : Number(btn.dataset.year);
  setFilterMenu(false);
  renderPubs();
});
pubsModal.addEventListener("click", (e) => {
  if (!filterMenu.hidden && !e.target.closest(".filter")) setFilterMenu(false);
});

document.querySelectorAll("[data-open=pubs-modal]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(pubsModal);
  });
});

// ---------------------------------------------------------------------------
// Modais (fecham no X, no Esc e clicando fora)
// ---------------------------------------------------------------------------
function openModal(dialog) {
  dialog.showModal();
  document.body.classList.add("has-modal");
}

document.querySelectorAll("dialog.modal").forEach((dialog) => {
  dialog.addEventListener("close", () => document.body.classList.remove("has-modal"));
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if ((e.target === dialog && outside) || e.target.closest("[data-close]")) dialog.close();
  });
});

// ---------------------------------------------------------------------------
// Carrossel de eventos
// ---------------------------------------------------------------------------
const track = document.querySelector(".carousel__track");
const navButtons = document.querySelectorAll(".carousel__nav");

function updateNav() {
  const max = track.scrollWidth - track.clientWidth - 1;
  navButtons[0].disabled = track.scrollLeft <= 0;
  navButtons[1].disabled = track.scrollLeft >= max;
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = track.querySelector(".event");
    const step = card ? card.offsetWidth + 26 : track.clientWidth;
    track.scrollBy({ left: step * Number(btn.dataset.dir) });
  });
});

track.addEventListener("scroll", updateNav, { passive: true });
window.addEventListener("resize", updateNav);

// ---------------------------------------------------------------------------
// Frases do topo (alternam a cada BIO_INTERVAL ms)
// ---------------------------------------------------------------------------
const bioEl = document.getElementById("hero-bio");
let bioIndex = 0;

function renderBio() {
  bioEl.innerHTML = BIO.map((b, i) =>
    `<span class="hero__bio-item${i === bioIndex ? " is-active" : ""}"${i === bioIndex ? "" : ' aria-hidden="true"'}>${pick(b)}</span>`
  ).join("");
}

function nextBio() {
  const items = bioEl.children;
  items[bioIndex].classList.remove("is-active");
  items[bioIndex].setAttribute("aria-hidden", "true");
  bioIndex = (bioIndex + 1) % BIO.length;
  items[bioIndex].classList.add("is-active");
  items[bioIndex].removeAttribute("aria-hidden");
}

let bioTimer = setInterval(nextBio, BIO_INTERVAL);
// Pausa enquanto o mouse está sobre a frase, para dar tempo de ler
bioEl.addEventListener("mouseenter", () => clearInterval(bioTimer));
bioEl.addEventListener("mouseleave", () => { bioTimer = setInterval(nextBio, BIO_INTERVAL); });

// ---------------------------------------------------------------------------
function render() {
  applyStrings();
  renderBio();
  renderTimelines();
  renderResearch();
  renderPubs();
  if (expModal.open) renderExpModal();
  window.onLangChange?.();
}

render();
updateNav();
loadPubs();
