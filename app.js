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
const srcset = (k) => `assets/cevora-${k}-960.webp 960w, ${img(k)} 1672w`;
function swapImg(el, k) {
  if (el.dataset.k === k) return;
  el.dataset.k = k;
  el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); // restart the fade
  el.srcset = srcset(k); el.src = img(k);
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let lang = "en";
try { if (localStorage.getItem("lang") === "ar") lang = "ar"; } catch {}
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
  lens.style.width = `${b.offsetWidth}px`;
  lens.style.height = `${b.offsetHeight}px`;
  lens.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
  // keep the chosen tab in view when the row scrolls sideways on phones
  const left = b.offsetLeft - (seg.clientWidth - b.offsetWidth) / 2;
  seg.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
}
addEventListener("resize", moveLens);

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
  $("#langFlag").src = `assets/flags/${other === "en" ? "ca" : "sa"}.svg`;
  $("#langLabel").textContent = STR[other].lang_full;
  fillCountries();
  showGal(gal);
  showType(type);
}

$("#langBtn").onclick = () => {
  lang = lang === "ar" ? "en" : "ar";
  try { localStorage.setItem("lang", lang); } catch {}
  // Cross-fade the whole page between languages where the browser supports it.
  if (document.startViewTransition && !reduceMotion) document.startViewTransition(render); else render();
};
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

// Demo form: countries drive the city list and the dialling code.
const EMAIL = "info@ceevora.com";
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
    Requirements: v("notes") || "-", "Site language": lang === "ar" ? "Arabic" : "English",
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
  } catch {
    $("#formErr").textContent = t("send_failed");
    const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(STR.en.emailSubject)}&body=${encodeURIComponent(body)}`;
  } finally {
    btn.disabled = false;
    btn.textContent = t("emailButton");
  }
};

render();

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
  const set = (open) => {
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", t(open ? "closeNavigation" : "openNavigation"));
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  };
  btn.onclick = () => set(menu.hidden);
  menu.onclick = (e) => { if (e.target.closest("a")) set(false); };
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); } });
  matchMedia("(min-width: 861px)").addEventListener("change", (m) => m.matches && set(false));
}
