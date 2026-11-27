// Ceevora site settings. Fill these in; anything left empty stays hidden on the site.
window.CEEVORA = {
  // Where demo requests are emailed.
  email: "info@ceevora.com",

  // WhatsApp business number, digits only with country code, e.g. "966501234567". Shows a floating chat button.
  whatsapp: "",

  // YouTube IDs of the marketing video. Arabic visitors get youtubeIdAr when it is set.
  youtubeId: "",
  youtubeIdAr: "",

  // Link to a try-it-yourself demo (e.g. a demo login). Shows a "Try the live demo" button.
  demoUrl: "",

  // Google Analytics 4 ID, e.g. "G-XXXXXXXXXX". Only loads after the visitor accepts the cookie notice.
  gaId: "",

  // Pricing for the quote builder, in SAR. Leave as null to show "custom quote" instead of numbers.
  // Example: { perShopMonthly: 199, perExtraTerminalMonthly: 79, setupPerShop: 500, modules: { inventory: 99, accounting: 149, ai: 99, kitchen: 99 } }
  pricing: null,

  // Plans for the "Compare plans" table. Leave empty to hide the table.
  // features: any of payments, shifts, catalog, inventory, kitchen, customers, accounting, reporting, branches, ai, integrations, support
  // Example:
  // plans: [
  //   { name_en: "Starter", name_ar: "الأساسية", price: 199, setup: 500, features: ["payments","shifts","catalog","reporting","support"] },
  //   { name_en: "Growth", name_ar: "النمو", price: 349, setup: 500, popular: true, features: ["payments","shifts","catalog","reporting","support","inventory","customers","branches"] },
  //   { name_en: "Enterprise", name_ar: "المؤسسات", price: null, features: ["payments","shifts","catalog","reporting","support","inventory","customers","branches","kitchen","accounting","ai","integrations"] },
  // ],
  plans: [],

  // Real customers only, with their permission. Each: { name, city, logo: "assets/customers/x.png", quote_en, quote_ar, person }
  customers: [],
};
