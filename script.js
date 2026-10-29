const API_BASE = "https://api.frankfurter.dev/v1";
const currencies = ["USD","INR","EUR","GBP","AED","CAD","AUD","SGD","JPY","CHF"];
let ratesToINR = {};
let lastRateDate = null;
const $ = (id) => document.getElementById(id);
const numberFormat = (value, max = 2) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: max }).format(value);
function setText(id, value) { const el = $(id); if (el) el.textContent = value; }
function formatCurrency(value, code) {
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency: code, maximumFractionDigits: code === "JPY" ? 0 : 2 }).format(value); }
  catch { return `${numberFormat(value)} ${code}`; }
}
function rateFor(from, to) {
  if (from === to) return 1;
  if (from === "INR") return 1 / ratesToINR[to];
  if (to === "INR") return ratesToINR[from];
  return ratesToINR[from] / ratesToINR[to];
}
function updateConverter() {
  const amount = Number($("amount").value);
  const from = $("fromCurrency").value, to = $("toCurrency").value;
  if (!Number.isFinite(amount) || amount < 0 || !ratesToINR[from] || !ratesToINR[to]) { $("result").value = "—"; return; }
  const result = amount * rateFor(from, to);
  $("result").value = numberFormat(result, 4);
  setText("conversionNote", `1 ${from} ≈ ${numberFormat(rateFor(from,to), 5)} ${to} · Indicative estimate`);
}
function updateRateCards() {
  for (const code of ["USD","EUR","GBP","AED","CAD","AUD"]) {
    const value = ratesToINR[code];
    setText(`rate${code}`, value ? `₹${numberFormat(value, 4)}` : "Unavailable");
  }
  setText("heroRate", ratesToINR.USD ? `₹${numberFormat(ratesToINR.USD, 2)}` : "—");
  setText("tickerUsd", ratesToINR.USD ? `₹${numberFormat(ratesToINR.USD, 2)}` : "—");
  setText("tickerEur", ratesToINR.EUR ? `₹${numberFormat(ratesToINR.EUR, 2)}` : "—");
  setText("tickerGbp", ratesToINR.GBP ? `₹${numberFormat(ratesToINR.GBP, 2)}` : "—");
  setText("tickerUsdEur", ratesToINR.USD && ratesToINR.EUR ? numberFormat(ratesToINR.USD/ratesToINR.EUR, 4) : "—");
}
async function loadRates() {
  setText("rateStatus", "Fetching reference rates…");
  $("refreshRates").disabled = true;
  try {
    // Fetch each currency against INR; public reference rates may update on business days.
    const codes = currencies.filter(c => c !== "INR").join(",");
    const response = await fetch(`${API_BASE}/latest?base=INR&symbols=${codes}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Rate service unavailable");
    const data = await response.json();
    ratesToINR = { INR: 1 };
    for (const [code, value] of Object.entries(data.rates || {})) {
      if (Number(value) > 0) ratesToINR[code] = 1 / Number(value);
    }
    lastRateDate = data.date || null;
    updateRateCards();
    updateConverter();
    setText("rateStatus", "Reference rates loaded");
    setText("updatedAt", `Reference rate date: ${lastRateDate || "date not supplied"} · checked ${new Date().toLocaleString()}`);
  } catch (error) {
    setText("rateStatus", "Rates unavailable — try again");
    setText("updatedAt", "Could not load rates. Check your internet connection and refresh.");
    $("result").value = "Unavailable";
  } finally {
    $("refreshRates").disabled = false;
  }
}
$("amount").addEventListener("input", updateConverter);
$("fromCurrency").addEventListener("change", updateConverter);
$("toCurrency").addEventListener("change", updateConverter);
$("refreshRates").addEventListener("click", loadRates);
$("swapCurrencies").addEventListener("click", () => {
  const from = $("fromCurrency"), to = $("toCurrency"), old = from.value;
  from.value = to.value; to.value = old; updateConverter();
});
$("menuToggle").addEventListener("click", () => {
  const nav = $("mainNav"), isOpen = nav.classList.toggle("open");
  $("menuToggle").setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll("#mainNav a").forEach(a => a.addEventListener("click", () => {
  $("mainNav").classList.remove("open"); $("menuToggle").setAttribute("aria-expanded", "false");
}));
const dialog = $("loginDialog");
$("loginOpen").addEventListener("click", () => dialog.showModal());
$("loginClose").addEventListener("click", () => dialog.close());
$("loginOkay").addEventListener("click", () => dialog.close());
$("contactForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("contactName").value.trim(), email = $("contactEmail").value.trim();
  const topic = $("contactTopic").value, message = $("contactMessage").value.trim();
  const subject = encodeURIComponent(`Exvora enquiry — ${topic}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`);
  // Replace this placeholder with your verified support address before launch.
  const supportEmail = "REPLACE_WITH_YOUR_SUPPORT_EMAIL";
  if (supportEmail.includes("REPLACE_WITH")) {
    setText("contactStatus", "Demo only: set your verified support email in script.js before using this form.");
    return;
  }
  window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
});
setText("year", new Date().getFullYear());
loadRates();
