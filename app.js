// Settings live in config.js.
const CFG = window.CEEVORA || {};
const videoId = () => (lang === "ar" && CFG.youtubeIdAr) || CFG.youtubeId || CFG.youtubeIdAr || "";


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
const srcset = (k) => `assets/cevora-${k}-960.webp 960w, ${img(k)} 1672w`;
function swapImg(el, k) {
  if (el.dataset.k === k) return;
  el.dataset.k = k;
  el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); // restart the fade
  el.srcset = srcset(k); el.src = img(k);
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Language: ?lang=ar in the link wins (for Arabic ads), then the visitor's saved choice, then their phone's language.
const params = new URLSearchParams(location.search);
let lang = "en";
{
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch {}
  const q = params.get("lang");
  if (q === "ar" || q === "en") lang = q;
  else if (saved === "ar" || saved === "en") lang = saved;
  else if ((navigator.languages || [navigator.language]).some((l) => /^ar(-|_|$)/i.test(l || ""))) lang = "ar";
}
// Remember which ad or campaign brought the visitor, for the demo request email.
const UTM = (() => {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid"];
  let got = Object.fromEntries(keys.filter((k) => params.get(k)).map((k) => [k, params.get(k).slice(0, 120)]));
  try {
    if (Object.keys(got).length) sessionStorage.setItem("utm", JSON.stringify(got));
    else got = JSON.parse(sessionStorage.getItem("utm") || "{}");
  } catch {}
  if (!Object.keys(got).length && document.referrer && !document.referrer.startsWith(location.origin)) got = { referrer: document.referrer.slice(0, 200) };
  return got;
})();
const t = (k) => STR[lang][k] ?? STR.en[k] ?? "";

// Build repeated content once; text is filled by render().
$("#modGrid").innerHTML = MODULES.map((m) =>
  `<article class="mod"><h3 data-t="module_${m}_title"></h3><p data-t="module_${m}_description"></p></article>`).join("");
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
  swapImg($("#galImg"), k);
  $("#galImg").alt = t(title);
  $("#galCap").textContent = desc ? `${t(title)}: ${t(desc)}` : t(title);
  document.querySelectorAll("#galTabs button").forEach((b, j) => b.setAttribute("aria-selected", j === gal));
}
function showType(k) {
  type = k;
  document.querySelectorAll("#typeTabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.type === k));
  moveLens();
  $("#typeList").innerHTML = [1, 2, 3].map((n) => `<li>${t(`type_${k}_${n}`)}</li>`).join("");
  swapImg($("#typeImg"), TYPE_IMG[k]);
  $("#typeImg").alt = t(`type_${k}`);
}

// The white lens glides under the selected business type (physical offsets, so RTL just works).
function moveLens() {
  const b = $(`#typeTabs [data-type="${type}"]`), seg = $("#typeTabs"), lens = $("#segLens");
  if (!b || !b.offsetWidth) return;
  // measure against the selector itself (offsetLeft depends on the offsetParent, which differs in Safari)
  const r = b.getBoundingClientRect(), sr = seg.getBoundingClientRect();
  const x = r.left - sr.left - seg.clientLeft + seg.scrollLeft, y = r.top - sr.top - seg.clientTop;
  lens.style.width = `${r.width}px`;
  lens.style.height = `${r.height}px`;
  lens.style.transform = `translate(${x}px, ${y}px)`;
  // keep the chosen tab in view when the row scrolls sideways
  const left = x - (seg.clientWidth - r.width) / 2;
  seg.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
}
addEventListener("resize", moveLens);
if ("ResizeObserver" in window) new ResizeObserver(() => moveLens()).observe(document.querySelector("#typeTabs"));
document.fonts?.ready.then(() => moveLens());

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
  // The button offers the other language: English with the Canadian flag, Arabic with the Saudi flag.
  const other = lang === "ar" ? "en" : "ar";
  $("#langBtn").lang = other;
  $("#langBtn").classList.toggle("lang-big", lang === "ar");
  const fl = $("#langFlag"), ca = other === "en";
  fl.src = `assets/flags/${ca ? "ca" : "sa"}.webp`; // 320px-wide masters, drawn at ~28px, so they stay sharp on any screen
  fl.width = ca ? 32 : 27; fl.height = ca ? 16 : 18;
  $("#langLabel").textContent = STR[other].lang_full;
  fillCountries();
  window.__syncSettings?.();
  renderQuote();
  renderCustomers();
  renderPlans();
  setLinks();
  showGal(gal);
  showType(type);
}

$("#langBtn").onclick = () => setLang(lang === "ar" ? "en" : "ar");
function setLang(next) {
  if (next === lang) return;
  lang = next;
  try { localStorage.setItem("lang", lang); } catch {}
  const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(null, "", u);
  // Cross-fade the whole page between languages where the browser supports it.
  if (document.startViewTransition && !reduceMotion) document.startViewTransition(render); else render();
}
$("#galTabs").onclick = (e) => { const b = e.target.closest("button"); if (b) showGal(+b.dataset.i); };
$("#galPrev").onclick = () => showGal(gal + (lang === "ar" ? 1 : -1));
$("#galNext").onclick = () => showGal(gal + (lang === "ar" ? -1 : 1));
let typeTour = null;
const stopTour = () => { clearInterval(typeTour); typeTour = null; };
$("#typeTabs").onclick = (e) => { const b = e.target.closest("button"); if (b) { stopTour(); showType(b.dataset.type); } };
// Arrow keys move between types (reversed in Arabic).
$("#typeTabs").onkeydown = (e) => {
  const order = [...document.querySelectorAll("#typeTabs button")].map((b) => b.dataset.type);
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!step) return;
  stopTour();
  const next = order[(order.indexOf(type) + step * (lang === "ar" ? -1 : 1) + order.length) % order.length];
  showType(next);
  $(`#typeTabs [data-type="${next}"]`).focus();
};
// First time the section scrolls into view, glide through every type once so visitors see they are buttons.
if (!reduceMotion && "IntersectionObserver" in window) {
  const order = ["cafe", "bakery", "restaurant", "retail", "cafe"];
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    seen.disconnect();
    let i = 0;
    typeTour = setInterval(() => { if (++i >= order.length) return stopTour(); showType(order[i]); }, 1300);
  }, { threshold: 0.6 });
  seen.observe($("#typeTabs"));
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) => $("#types").addEventListener(ev, stopTour, { passive: true }));
}

// Viewer dialog: zoomed screenshot or the video.
const viewer = $("#viewer");
const openViewer = (html) => { $("#viewerBody").innerHTML = html; viewer.showModal(); };
viewer.addEventListener("close", () => { $("#viewerBody").innerHTML = ""; });
viewer.onclick = (e) => { if (e.target === viewer || e.target.closest(".close")) viewer.close(); };
$("#galImgBtn").onclick = () => openViewer(`<img src="${img($("#galImg").dataset.k)}" alt="${$("#galImg").alt}">`);

if (CFG.youtubeId || CFG.youtubeIdAr) {
  $("#videoSoon").hidden = true;
  $("#videoBtn").onclick = () => openViewer(
    `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId())}?autoplay=1&rel=0&hl=${lang}&cc_load_policy=1" title="Ceevora POS tour" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`);
} else {
  $("#videoBtn").onclick = () => $("#contact").scrollIntoView({ behavior: "smooth" });
}

// ZATCA button pre-fills the notes field.
document.querySelectorAll("[data-note]").forEach((a) => a.addEventListener("click", () => {
  const n = $("#demoForm").notes;
  if (!n.value.includes(a.dataset.note)) n.value = (n.value ? n.value + "\n" : "") + a.dataset.note;
}));

// Demo form: countries drive the city list and the dialling code.
const EMAIL = CFG.email || "info@ceevora.com";
const C = (en, ar, dial, eg, cities) => ({ en, ar, dial, eg, cities: cities.map(([e, a]) => ({ en: e, ar: a })) });
const COUNTRIES = {
  SA: C("Saudi Arabia", "المملكة العربية السعودية", "+966", "50 123 4567", [["Riyadh","الرياض"],["Jeddah","جدة"],["Makkah","مكة المكرمة"],["Madinah","المدينة المنورة"],["Dammam","الدمام"],["Khobar","الخبر"],["Dhahran","الظهران"],["Al Ahsa","الأحساء"],["Jubail","الجبيل"],["Taif","الطائف"],["Tabuk","تبوك"],["Abha","أبها"],["Khamis Mushait","خميس مشيط"],["Buraidah","بريدة"],["Hail","حائل"],["Jazan","جازان"],["Najran","نجران"],["Yanbu","ينبع"]]),
  AE: C("United Arab Emirates", "الإمارات العربية المتحدة", "+971", "50 123 4567", [["Dubai","دبي"],["Abu Dhabi","أبوظبي"],["Sharjah","الشارقة"],["Ajman","عجمان"],["Ras Al Khaimah","رأس الخيمة"],["Fujairah","الفجيرة"],["Umm Al Quwain","أم القيوين"],["Al Ain","العين"]]),
  QA: C("Qatar", "قطر", "+974", "3312 3456", [["Doha","الدوحة"],["Lusail","لوسيل"],["Al Rayyan","الريان"],["Al Wakrah","الوكرة"],["Al Khor","الخور"],["Umm Salal","أم صلال"]]),
  KW: C("Kuwait", "الكويت", "+965", "5001 2345", [["Kuwait City","مدينة الكويت"],["Hawalli","حولي"],["Salmiya","السالمية"],["Farwaniya","الفروانية"],["Jahra","الجهراء"],["Ahmadi","الأحمدي"],["Mubarak Al-Kabeer","مبارك الكبير"]]),
  BH: C("Bahrain", "البحرين", "+973", "3600 1234", [["Manama","المنامة"],["Muharraq","المحرق"],["Riffa","الرفاع"],["Hamad Town","مدينة حمد"],["Isa Town","مدينة عيسى"]]),
  OM: C("Oman", "عُمان", "+968", "9212 3456", [["Muscat","مسقط"],["Salalah","صلالة"],["Sohar","صحار"],["Nizwa","نزوى"],["Sur","صور"]]),
  JO: C("Jordan", "الأردن", "+962", "7 9012 3456", [["Amman","عمّان"],["Irbid","إربد"],["Zarqa","الزرقاء"],["Aqaba","العقبة"]]),
  EG: C("Egypt", "مصر", "+20", "100 123 4567", [["Cairo","القاهرة"],["Giza","الجيزة"],["Alexandria","الإسكندرية"]]),
  CA: C("Canada", "كندا", "+1", "416 555 0123", [["Toronto","تورونتو"],["Montreal","مونتريال"],["Vancouver","فانكوفر"],["Calgary","كالغاري"],["Edmonton","إدمونتون"],["Ottawa","أوتاوا"],["Mississauga","ميسيساغا"],["Winnipeg","وينيبيغ"],["Hamilton","هاميلتون"],["London","لندن"],["Halifax","هاليفاكس"],["Quebec City","مدينة كيبك"],["St. John's","سانت جونز"]]),
};
// National number length (digits after the country code, leading 0 dropped).
const PHONE_LEN = { SA: [9], AE: [9], QA: [8], KW: [8], BH: [8], OM: [8], JO: [9], EG: [10], CA: [10] };
const form = $("#demoForm");
const OTHER = "__other";

function fillCountries() {
  const cur = form.country.value || "SA";
  form.country.innerHTML = Object.entries(COUNTRIES).map(([k, c]) => `<option value="${k}">${c[lang]}</option>`).join("");
  form.country.value = cur;
  fillCities();
}
function fillCities() {
  const c = COUNTRIES[form.country.value];
  const cur = form.city.value;
  form.city.innerHTML = `<option value="" disabled selected>${t("selectCity")}</option>` +
    c.cities.map((x, i) => `<option value="${i}">${x[lang]}</option>`).join("") +
    `<option value="${OTHER}">${t("otherCity")}</option>`;
  if ([...form.city.options].some((o) => o.value === cur && cur)) form.city.value = cur;
  form.dial.value = c.dial;
  form.phone.placeholder = c.eg;
  toggleOther();
}
function toggleOther() {
  const other = form.city.value === OTHER;
  $("#otherCityRow").hidden = !other;
  form.otherCity.required = other;
}
form.country.onchange = () => { form.city.value = ""; fillCities(); };
form.city.onchange = toggleOther;

function emailBody() {
  const v = (n) => form[n].value.trim();
  const c = COUNTRIES[v("country")];
  const city = v("city") === OTHER ? v("otherCity") : c.cities[+v("city")]?.en || "";
  return {
    Company: v("company"), Name: v("name"), Email: v("email"),
    Phone: `${v("dial")} ${v("phone")}`, Country: c.en, City: city,
    Locations: v("locations"), "POS terminals": v("terminals"),
    "Contact by": form.querySelector("[name=contactBy]:checked")?.value || "-",
    "Preferred time": v("when") ? `${new Date(v("when")).toString().slice(0, 21)} (visitor's time, ${Intl.DateTimeFormat().resolvedOptions().timeZone})` : "-",
    Requirements: v("notes") || "-", "Site language": lang === "ar" ? "Arabic" : "English",
    "Came from": Object.entries(UTM).map(([k, v]) => `${k}=${v}`).join(", ") || "direct",
  };
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const bad = [...form.elements].find((el) => el.willValidate && !el.checkValidity());
  if (bad) {
    $("#formErr").textContent = `${t("required")}: ${bad.closest("label").querySelector("span").textContent}`;
    bad.focus();
    return;
  }
  const digits = form.phone.value.replace(/[^0-9]/g, "").replace(/^0+/, "");
  if (!(PHONE_LEN[form.country.value] || [7, 8, 9, 10, 11, 12]).includes(digits.length)) {
    $("#formErr").textContent = `${t("field_phone")}: ${t("phoneHint").replace("50 123 4567", COUNTRIES[form.country.value].eg)}`;
    form.phone.focus();
    return;
  }
  $("#formErr").textContent = "";
  if (form._honey.value) return; // bot
  const data = emailBody();
  const btn = $("#sendBtn");
  btn.disabled = true;
  btn.textContent = t("sending");
  try {
    // FormSubmit forwards the request to EMAIL. The first ever submission sends an activation link to that inbox.
    const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...data, _subject: `Ceevora POS demo request: ${data.Company}`, _replyto: data.Email, _template: "table", _captcha: "false" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || String(j.success) !== "true") throw new Error(j.message || r.status);
    form.hidden = true;
    $("#sentBox").hidden = false;
    showCalendar(form.when.value);
  } catch {
    $("#formErr").textContent = t("send_failed");
    const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(STR.en.emailSubject)}&body=${encodeURIComponent(body)}`;
  } finally {
    btn.disabled = false;
    btn.textContent = t("emailButton");
  }
};


// ---------- motion (transform/opacity only; all of it skipped for reduced motion) ----------
document.documentElement.classList.add("js");
if (!reduceMotion && "IntersectionObserver" in window) {
  // Reveal blocks as they scroll in; cards inside grids stagger.
  document.querySelectorAll(".steps li").forEach((el, i) => {
    el.setAttribute("data-r", ""); el.style.setProperty("--d", `${(i % 4) * 70}ms`);
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));

  // Specular highlight follows the pointer on glass controls (written per element, never on :root).
  document.querySelectorAll(".lg-btn, .video-card, .zatca, .form, .hero-shot").forEach((el) => {
    el.classList.add("spec");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });
  });

  // Hero screenshot tilts flat as you scroll past it.
  const shot = $(".hero-shot");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      shot.style.setProperty("--tilt", `${Math.max(0, 10 - y / 30)}deg`);
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
} else {
  document.querySelectorAll("[data-r]").forEach((el) => el.classList.add("in"));
}

// Nav firms up after scrolling; reading-progress bar; mobile CTA hides over the form.
{
  const nav = $(".nav"), bar = $("#progress"), mcta = $("#mcta"), contact = $("#contact");
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("scrolled", scrollY > 24);
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const c = contact.getBoundingClientRect();
    mcta.classList.toggle("show", scrollY > innerHeight * 0.6 && !(c.top < innerHeight && c.bottom > 0));
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

// Mobile menu
{
  const btn = $("#burger"), menu = $("#mnav");
  let isOpen = false, timer = 0;
  const set = (open) => {
    if (open === isOpen) return;
    isOpen = open;
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", t(open ? "closeNavigation" : "openNavigation"));
    clearTimeout(timer);
    if (open) {
      menu.hidden = false;
      void menu.offsetHeight; // commit the closed state so the reveal transitions
      menu.classList.add("open");
    } else {
      menu.classList.remove("open");
      timer = setTimeout(() => { menu.hidden = true; }, reduceMotion ? 0 : 380);
    }
  };
  btn.onclick = () => set(!isOpen);
  menu.onclick = (e) => { if (e.target.closest("a")) set(false); };
  addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) { set(false); btn.focus(); } });
  matchMedia("(min-width: 861px)").addEventListener("change", (m) => m.matches && set(false));
}

// ---------- quote builder ----------
const QMODS = ["inventory", "accounting", "kitchen", "ai", "delivery"];
const qf = $("#qform");
$("#qmods").innerHTML = QMODS.map((m) =>
  `<label class="mod-opt"><input type="checkbox" name="qm" value="${m}"><span data-t="qm_${m}"></span></label>`).join("");
const sar = (n) => new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-SA", { maximumFractionDigits: 0 }).format(n) + (lang === "ar" ? " ر.س" : " SAR");
function quoteState() {
  const clamp = (el) => Math.max(+el.min, Math.min(+el.max, Math.round(+el.value) || +el.min));
  const shops = clamp($("#qshops")), terms = Math.max(shops, clamp($("#qterms")));
  return { type: $("#qtype").value, shops, terms, mods: [...qf.querySelectorAll("[name=qm]:checked")].map((c) => c.value) };
}
function renderQuote() {
  const cur = $("#qtype").value || type;
  $("#qtype").innerHTML = ["cafe", "bakery", "restaurant", "retail"].map((k) => `<option value="${k}">${t("type_" + k)}</option>`).join("");
  $("#qtype").value = cur;
  qf.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  qf.querySelectorAll("[data-step]").forEach((b) =>
    b.setAttribute("aria-label", `${b.dataset.step > 0 ? "+" : "−"} ${t(b.dataset.for === "qshops" ? "q_shops" : "q_terms")}`));
  const q = quoteState();
  $("#qlines").innerHTML = [
    t("type_" + q.type),
    t("q_shops_n").replace("{n}", q.shops) + " · " + t("q_terms_n").replace("{n}", q.terms),
    t("q_core"),
    ...q.mods.map((m) => "+ " + t("qm_" + m)),
  ].map((x) => `<li>${x}</li>`).join("");
  const P = CFG.pricing;
  if (P) {
    const monthly = q.shops * (P.perShopMonthly || 0) + (q.terms - q.shops) * (P.perExtraTerminalMonthly || 0) +
      q.mods.reduce((sum, m) => sum + (P.modules?.[m] || 0) * q.shops, 0);
    $("#qprice").innerHTML = `<span>${t("q_monthly")}</span><strong>${sar(monthly)}</strong>` +
      (P.setupPerShop ? `<span>${t("q_setup")}</span><b>${sar(P.setupPerShop * q.shops)}</b>` : "");
  } else {
    $("#qprice").innerHTML = `<strong class="qcustom">${t("q_custom")}</strong>`;
  }
}
qf.addEventListener("input", renderQuote);
qf.addEventListener("change", renderQuote);
qf.addEventListener("submit", (e) => e.preventDefault());
qf.addEventListener("click", (e) => {
  const b = e.target.closest("[data-step]"); if (!b) return;
  const el = $("#" + b.dataset.for);
  el.value = Math.max(+el.min, Math.min(+el.max, (+el.value || 0) + +b.dataset.step));
  if (el.id === "qshops" && +$("#qterms").value < +el.value) $("#qterms").value = el.value;
  renderQuote();
});
// "Get my quote" carries the setup into the demo form.
$("#qcta").addEventListener("click", () => {
  const q = quoteState();
  form.locations.value = q.shops;
  form.terminals.value = q.terms;
  const line = `${STR.en["type_" + q.type]}; modules: ${q.mods.map((m) => STR.en["qm_" + m]).join(", ") || "core POS only"}`;
  form.notes.value = form.notes.value.replace(/^.*modules: .*$/m, "").trim();
  form.notes.value = (form.notes.value ? form.notes.value + "\n" : "") + line;
});
$("#typeTabs").addEventListener("click", () => { $("#qtype").value = type; renderQuote(); });

// ---------- customers (real ones only, from config.js) ----------
function renderCustomers() {
  const list = CFG.customers || [];
  $("#customers").hidden = !list.length;
  const esc = (x) => String(x ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  $("#custList").innerHTML = list.map((c) => `<figure class="cust-card">
    ${c.logo ? `<img src="${esc(c.logo)}" alt="${esc(c.name)}" loading="lazy" height="48">` : `<b>${esc(c.name)}</b>`}
    ${c["quote_" + lang] ? `<blockquote>${esc(c["quote_" + lang])}</blockquote>` : ""}
    <figcaption>${esc(c.person ? c.person + ", " : "")}${esc(c.name)}${c.city ? " · " + esc(c.city) : ""}</figcaption></figure>`).join("");
}

// ---------- WhatsApp + live demo links ----------
function setLinks() {
  const wa = $("#wa"), digits = String(CFG.whatsapp || "").replace(/\D/g, "");
  wa.hidden = !digits;
  if (digits) wa.href = `https://wa.me/${digits}?text=${encodeURIComponent(t("wa_msg"))}`;
  const demo = $("#tryDemo");
  demo.hidden = !CFG.demoUrl;
  if (CFG.demoUrl) demo.href = CFG.demoUrl;
}

// ---------- analytics, only after consent ----------
if (CFG.gaId) {
  let choice = null;
  try { choice = localStorage.getItem("cookies"); } catch {}
  const loadGA = () => {
    const sc = document.createElement("script");
    sc.async = true; sc.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CFG.gaId)}`;
    document.head.appendChild(sc);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", CFG.gaId);
    // count demo requests as conversions
    $("#sentBox") && new MutationObserver(() => { if (!$("#sentBox").hidden) gtag("event", "generate_lead"); }).observe($("#sentBox"), { attributes: true });
  };
  const decide = (yes) => { try { localStorage.setItem("cookies", yes ? "yes" : "no"); } catch {} $("#cookie").hidden = true; if (yes) loadGA(); };
  if (choice === "yes") loadGA(); else if (choice !== "no") $("#cookie").hidden = false;
  $("#ckYes").onclick = () => decide(true);
  $("#ckNo").onclick = () => decide(false);
}

// ---------- Settings: appearance, motion, language (saved on this device) ----------
{
  const root = document.documentElement, btn = $("#gearBtn"), panel = $("#settings");
  const get = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
  const put = (k, v) => { try { v === "system" ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
  const current = { theme: () => get("theme", "system"), lang: () => lang };
  const sync = () => panel.querySelectorAll(".choice").forEach((c) => {
    const opts = [...c.querySelectorAll("button")], v = current[c.dataset.pref]();
    const i = Math.max(0, opts.findIndex((b) => b.dataset.v === v));
    opts.forEach((b, j) => b.setAttribute("aria-checked", j === i));
    c.style.setProperty("--i", i); c.style.setProperty("--n", opts.length);
  });
  const apply = {
    theme: (v) => { put("theme", v); v === "system" ? delete root.dataset.theme : (root.dataset.theme = v); },
    lang: (v) => setLang(v),
  };
  panel.addEventListener("click", (e) => {
    const b = e.target.closest(".choice button"); if (!b) return;
    apply[b.closest(".choice").dataset.pref](b.dataset.v); sync();
  });
  // arrow keys inside a segmented control, like a native radio group
  panel.addEventListener("keydown", (e) => {
    const b = e.target.closest(".choice button"); const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!b || !step) return;
    const opts = [...b.parentElement.children], n = opts[(opts.indexOf(b) + step * (lang === "ar" ? -1 : 1) + opts.length) % opts.length];
    n.focus(); n.click(); e.preventDefault();
  });
  let open = false, timer = 0;
  const setOpen = (o) => {
    if (o === open) return; open = o; clearTimeout(timer);
    btn.setAttribute("aria-expanded", o);
    if (o) { sync(); panel.hidden = false; void panel.offsetHeight; panel.classList.add("open"); }
    else { panel.classList.remove("open"); timer = setTimeout(() => { panel.hidden = true; }, reduceMotion ? 0 : 300); }
  };
  btn.onclick = (e) => { e.stopPropagation(); setOpen(!open); };
  document.addEventListener("click", (e) => { if (open && !panel.contains(e.target)) setOpen(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { setOpen(false); btn.focus(); } });
  addEventListener("scroll", () => open && setOpen(false), { passive: true });
  window.__syncSettings = sync;
}


// ---------- add-to-calendar after a demo request (only when a preferred time was picked) ----------
function showCalendar(when) {
  if (!when) return;
  const start = new Date(when); if (isNaN(start)) return;
  const end = new Date(start.getTime() + 30 * 60000);
  const z = (d) => d.toISOString().replace(/[-:]/g, "").replace(/[.][0-9]{3}/, "");
  const title = t("cal_title"), details = `${t("cal_note")} ${EMAIL}`;
  $("#calGoogle").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${z(start)}/${z(end)}&details=${encodeURIComponent(details)}`;
  const esc = (x) => x.replace(/([,;])/g, "$1".replace("$1", String.fromCharCode(92) + "$1"));
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ceevora//Demo//EN", "BEGIN:VEVENT",
    `UID:${Date.now()}@ceevora`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(start)}`, `DTEND:${z(end)}`,
    `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(details)}`,
    "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", `DESCRIPTION:${esc(title)}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"].join(String.fromCharCode(13, 10));
  $("#calIcs").href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  $("#calBox").hidden = false;
}
// earliest pickable demo time: one hour from now, on the quarter hour
{
  const d = new Date(Date.now() + 3600000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  form.when.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- compare plans (from config.js; hidden until real plans exist) ----------
const FEATURES = ["payments", "shifts", "catalog", "reporting", "support", "inventory", "customers", "branches", "kitchen", "accounting", "ai", "integrations"];
function renderPlans() {
  const plans = CFG.plans || [];
  $("#plans").hidden = !plans.length;
  if (!plans.length) return;
  const esc = (x) => String(x ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const name = (p) => esc(p["name_" + lang] || p.name_en || p.name);
  const check = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const used = FEATURES.filter((f) => plans.some((p) => (p.features || []).includes(f)));
  $("#plansTable").innerHTML =
    `<thead><tr><th scope="col"><span class="sr">${t("plans_title")}</span></th>${plans.map((p) => `<th scope="col" class="${p.popular ? "pop" : ""}">
      ${p.popular ? `<span class="pop-tag">${t("popular")}</span>` : ""}<span class="pname">${name(p)}</span>
      <span class="pprice">${p.price == null ? t("custom_price") : sar(p.price)}</span>${p.price == null ? "" : `<span class="pper">${t("per_month")}</span>`}
      ${p.setup ? `<span class="psetup">${t("setup_fee").replace("{fee}", sar(p.setup))}</span>` : ""}</th>`).join("")}</tr></thead>
    <tbody>${used.map((f) => `<tr><th scope="row">${t("f_" + f)}</th>${plans.map((p) => `<td class="${p.popular ? "pop" : ""}">${(p.features || []).includes(f) ? check + `<span class="sr">✓</span>` : '<span class="dash" aria-label="—">—</span>'}</td>`).join("")}</tr>`).join("")}</tbody>
    <tfoot><tr><td></td>${plans.map((p, i) => `<td class="${p.popular ? "pop" : ""}"><a class="btn ${p.popular ? "btn-solid" : "btn-line"}" href="#contact" data-plan="${i}">${t("choose_plan").replace("{plan}", name(p))}</a></td>`).join("")}</tr></tfoot>`;
}
$("#plansTable").addEventListener("click", (e) => {
  const a = e.target.closest("[data-plan]"); if (!a) return;
  const p = CFG.plans[+a.dataset.plan], line = `Plan: ${p.name_en || p.name}`;
  form.notes.value = form.notes.value.replace(/^Plan: .*$/m, "").trim();
  form.notes.value = line + (form.notes.value ? String.fromCharCode(10) + form.notes.value : "");
});

// ---------- share ----------
$("#shareBtn").onclick = async () => {
  const url = new URL(location.href); url.hash = ""; url.searchParams.set("lang", lang);
  const data = { title: t("siteTitle"), text: t("heroBody"), url: url.toString() };
  try {
    if (navigator.share) return await navigator.share(data);
    await navigator.clipboard.writeText(data.url);
    const s = $("#shareBtn span"); s.textContent = t("copied"); setTimeout(() => { s.textContent = t("share"); }, 1800);
  } catch {}
};

render();
