// Ceevora site settings. Fill these in; anything left empty stays hidden on the site.
window.CEEVORA = {
  // Where demo requests are emailed.
  email: "info@ceevora.com",

  // WhatsApp business number, digits only with country code, e.g. "966501234567". Shows a floating chat button.
  whatsapp: "",

  // YouTube ID of the marketing video, e.g. "abc123XYZ".
  youtubeId: "",

  // Link to a try-it-yourself demo (e.g. a demo login). Shows a "Try the live demo" button.
  demoUrl: "",

  // Google Analytics 4 ID, e.g. "G-XXXXXXXXXX". Only loads after the visitor accepts the cookie notice.
  gaId: "",

  // Pricing for the quote builder, in SAR. Leave as null to show "custom quote" instead of numbers.
  // Example: { perShopMonthly: 199, perExtraTerminalMonthly: 79, setupPerShop: 500, modules: { inventory: 99, accounting: 149, ai: 99, kitchen: 99 } }
  pricing: null,

  // Real customers only, with their permission. Each: { name, city, logo: "assets/customers/x.png", quote_en, quote_ar, person }
  customers: [],
};
