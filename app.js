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
