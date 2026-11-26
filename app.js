// Paste the YouTube video ID here once the marketing video is uploaded (e.g. "dQw4w9WgXcQ").
const YOUTUBE_ID = "";

const $ = (s, r = document) => r.querySelector(s);
const SHOTS = [
  ["terminal", "screenshot_checkout_title"],
  ["dashboard", "screenshot_dashboard_title", "screenshot_dashboard_description"],
  ["transaction_history", "screenshot_transactions_title"],
  ["products", "screenshot_products_title"],
  ["promotions", "screenshot_promotions_title"],
  ["stock", "screenshot_stock_title", "screenshot_stock_description"],
  ["stores", "screenshot_stores_title"],
  ["jv_details", "screenshot_journal_title", "screenshot_journal_description"],
];
const MODULES = ["payments", "shifts", "catalog", "inventory", "kitchen", "customers", "accounting", "reporting", "branches", "ai", "integrations"];
const TYPE_IMG = { cafe: "terminal", bakery: "stock", restaurant: "transaction_history", retail: "products" };
const FAQ = { setup: 3, operations: 4, permissions: 3, reporting: 3 };
const img = (k) => `assets/cevora-${k}.webp`;

let lang = "en";
try { if (localStorage.getItem("lang") === "ar") lang = "ar"; } catch {}
const t = (k) => STR[lang][k] ?? STR.en[k] ?? "";

// Build repeated content once; text is filled by render().
$("#modGrid").innerHTML = MODULES.map((m) =>
  `<article class="card"><h3 data-t="module_${m}_title"></h3><p data-t="module_${m}_description"></p></article>`).join("");
$("#faqList").innerHTML = Object.entries(FAQ).map(([g, n]) =>
  `<h3 class="faq-group" data-t="faq_${g}_title"></h3>` +
  Array.from({ length: n }, (_, i) =>
    `<details><summary data-t="faq_${g}_${i + 1}_question"></summary><p data-t="faq_${g}_${i + 1}_answer"></p></details>`).join("")).join("");
$("#galTabs").innerHTML = SHOTS.map(([, title], i) =>
  `<button role="tab" type="button" data-i="${i}" data-t="${title}"></button>`).join("");

let gal = 0, type = "cafe";
function showGal(i) {
  gal = (i + SHOTS.length) % SHOTS.length;
  const [k, title, desc] = SHOTS[gal];
  $("#galImg").src = img(k);
  $("#galImg").alt = t(title);
  $("#galCap").textContent = desc ? `${t(title)}: ${t(desc)}` : t(title);
  document.querySelectorAll("#galTabs button").forEach((b, j) => b.setAttribute("aria-selected", j === gal));
}
function showType(k) {
  type = k;
  document.querySelectorAll("#typeTabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.type === k));
  $("#typeList").innerHTML = [1, 2, 3].map((n) => `<li>${t(`type_${k}_${n}`)}</li>`).join("");
  $("#typeImg").src = img(TYPE_IMG[k]);
  $("#typeImg").alt = t(`type_${k}`);
}

function render() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = t("siteTitle");
  document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll("[data-t-label]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.tLabel)));
  document.querySelectorAll("[data-t-ph]").forEach((el) => { el.placeholder = t(el.dataset.tPh); });
  document.querySelectorAll("[data-t-value]").forEach((el) => {
    if (!el.value || Object.values(STR).some((d) => d[el.dataset.tValue] === el.value)) el.value = t(el.dataset.tValue);
  });
  $("#langBtn").lang = lang === "ar" ? "en" : "ar";
  showGal(gal);
  showType(type);
}

$("#langBtn").onclick = () => {
  lang = lang === "ar" ? "en" : "ar";
  try { localStorage.setItem("lang", lang); } catch {}
  render();
};
$("#galTabs").onclick = (e) => { const b = e.target.closest("button"); if (b) showGal(+b.dataset.i); };
$("#galPrev").onclick = () => showGal(gal + (lang === "ar" ? 1 : -1));
$("#galNext").onclick = () => showGal(gal + (lang === "ar" ? -1 : 1));
$("#typeTabs").onclick = (e) => { const b = e.target.closest("button"); if (b) showType(b.dataset.type); };

// Viewer dialog: zoomed screenshot or the video.
const viewer = $("#viewer");
const openViewer = (html) => { $("#viewerBody").innerHTML = html; viewer.showModal(); };
viewer.addEventListener("close", () => { $("#viewerBody").innerHTML = ""; });
viewer.onclick = (e) => { if (e.target === viewer || e.target.closest(".close")) viewer.close(); };
$("#galImgBtn").onclick = () => openViewer(`<img src="${$("#galImg").src}" alt="${$("#galImg").alt}">`);

if (YOUTUBE_ID) {
  $("#videoSoon").hidden = true;
  $("#videoBtn").onclick = () => openViewer(
    `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(YOUTUBE_ID)}?autoplay=1&rel=0&hl=${lang}&cc_load_policy=1" title="Ceevora POS tour" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`);
} else {
  $("#videoBtn").onclick = () => $("#contact").scrollIntoView({ behavior: "smooth" });
}

// ZATCA button pre-fills the notes field.
document.querySelectorAll("[data-note]").forEach((a) => a.addEventListener("click", () => {
  const n = $("#demoForm").notes;
  if (!n.value.includes(a.dataset.note)) n.value = (n.value ? n.value + "\n" : "") + a.dataset.note;
}));

// Demo form -> email draft (same behaviour as the existing site's contact page).
$("#demoForm").onsubmit = (e) => {
  e.preventDefault();
  const f = e.target;
  const bad = [...f.elements].find((el) => el.willValidate && !el.checkValidity());
  if (bad) { $("#formErr").textContent = `${bad.closest("label").querySelector("span").textContent}?`; bad.focus(); return; }
  $("#formErr").textContent = "";
  const v = (n) => f[n].value.trim();
  const body = [t("emailGreeting"), "", t("emailBody"), "",
    `${t("field_company")}: ${v("company")}`,
    `${t("field_name")}: ${v("name")}`,
    `${t("field_email")}: ${v("email")}`,
    `${t("field_phone")}: ${v("dial")} ${v("phone")}`,
    `${t("field_country")}: ${v("country")}`,
    `${t("field_city")}: ${v("city")}`,
    `${t("field_locations")}: ${v("locations")}`,
    `${t("field_terminals")}: ${v("terminals")}`,
    v("notes") ? `${t("notes")}: ${v("notes")}` : null].filter((x) => x !== null).join("\n");
  location.href = `mailto:info@ceevora.com?subject=${encodeURIComponent(t("emailSubject"))}&body=${encodeURIComponent(body)}`;
};

render();
