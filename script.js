const API_BASE = "https://api.frankfurter.dev/v1";

const $ = id => document.getElementById(id);

let currencies = [];
let ratesToINR = { INR: 1 };
let lastRateDate = null;

const currencyMeta = {
  USD: { flag: "🇺🇸", symbol: "$" },
  INR: { flag: "🇮🇳", symbol: "₹" },
  EUR: { flag: "🇪🇺", symbol: "€" },
  GBP: { flag: "🇬🇧", symbol: "£" },
  AED: { flag: "🇦🇪", symbol: "د.إ" },
  CAD: { flag: "🇨🇦", symbol: "C$" },
  AUD: { flag: "🇦🇺", symbol: "A$" },
  SGD: { flag: "🇸🇬", symbol: "S$" },
  JPY: { flag: "🇯🇵", symbol: "¥" },
  CHF: { flag: "🇨🇭", symbol: "CHF" },
  CNY: { flag: "🇨🇳", symbol: "¥" },
  NZD: { flag: "🇳🇿", symbol: "NZ$" },
  HKD: { flag: "🇭🇰", symbol: "HK$" },
  SAR: { flag: "🇸🇦", symbol: "﷼" },
  QAR: { flag: "🇶🇦", symbol: "ر.ق" },
  KWD: { flag: "🇰🇼", symbol: "د.ك" },
  BHD: { flag: "🇧🇭", symbol: ".د.ب" },
  OMR: { flag: "🇴🇲", symbol: "ر.ع." },
  PKR: { flag: "🇵🇰", symbol: "₨" },
  BDT: { flag: "🇧🇩", symbol: "৳" },
  LKR: { flag: "🇱🇰", symbol: "Rs" },
  NPR: { flag: "🇳🇵", symbol: "रु" },
  THB: { flag: "🇹🇭", symbol: "฿" },
  MYR: { flag: "🇲🇾", symbol: "RM" },
  IDR: { flag: "🇮🇩", symbol: "Rp" },
  PHP: { flag: "🇵🇭", symbol: "₱" },
  KRW: { flag: "🇰🇷", symbol: "₩" },
  ZAR: { flag: "🇿🇦", symbol: "R" },
  BRL: { flag: "🇧🇷", symbol: "R$" },
  MXN: { flag: "🇲🇽", symbol: "$" },
  TRY: { flag: "🇹🇷", symbol: "₺" },
  RUB: { flag: "🇷🇺", symbol: "₽" },
  PLN: { flag: "🇵🇱", symbol: "zł" },
  SEK: { flag: "🇸🇪", symbol: "kr" },
  NOK: { flag: "🇳🇴", symbol: "kr" },
  DKK: { flag: "🇩🇰", symbol: "kr" },
  ISK: { flag: "🇮🇸", symbol: "kr" },
  CZK: { flag: "🇨🇿", symbol: "Kč" },
  HUF: { flag: "🇭🇺", symbol: "Ft" },
  RON: { flag: "🇷🇴", symbol: "lei" },
  BGN: { flag: "🇧🇬", symbol: "лв" },
  UAH: { flag: "🇺🇦", symbol: "₴" },
  ILS: { flag: "🇮🇱", symbol: "₪" },
  EGP: { flag: "🇪🇬", symbol: "£" },
  NGN: { flag: "🇳🇬", symbol: "₦" },
  KES: { flag: "🇰🇪", symbol: "KSh" },
  GHS: { flag: "🇬🇭", symbol: "₵" },
  MAD: { flag: "🇲🇦", symbol: "د.م." },
  TND: { flag: "🇹🇳", symbol: "د.ت" },
  ARS: { flag: "🇦🇷", symbol: "$" },
  CLP: { flag: "🇨🇱", symbol: "$" },
  COP: { flag: "🇨🇴", symbol: "$" },
  PEN: { flag: "🇵🇪", symbol: "S/" },
  VND: { flag: "🇻🇳", symbol: "₫" },
  KHR: { flag: "🇰🇭", symbol: "៛" },
  MMK: { flag: "🇲🇲", symbol: "K" }
};

function numberFormat(value, max = 2) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: max
  }).format(value);
}

function moneyFormat(value, code) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "JPY" ? 0 : 2
    }).format(value);
  } catch {
    return `${numberFormat(value)} ${code}`;
  }
}

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

async function loadCurrencies() {
  const from = $("fromCurrency");
  const to = $("toCurrency");

  from.innerHTML = "";
  to.innerHTML = "";

  try {
    const data = await fetchJSON(`${API_BASE}/currencies`);

    currencies = Object.entries(data)
      .map(([code, name]) => ({
        code,
        name: String(name)
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    currencies.forEach(currency => {
      const meta = currencyMeta[currency.code] || {};
      const flag = meta.flag || "🌐";
      const label = `${flag} ${currency.code} — ${currency.name}`;

      from.add(new Option(label, currency.code));
      to.add(new Option(label, currency.code));
    });

    from.value = currencies.some(c => c.code === "USD")
      ? "USD"
      : currencies[0]?.code || "INR";

    to.value = currencies.some(c => c.code === "INR")
      ? "INR"
      : currencies[1]?.code || from.value;

  } catch (error) {
    console.error("Could not load currency list:", error);

    const fallback = [
      { code: "USD", name: "US Dollar" },
      { code: "INR", name: "Indian Rupee" },
      { code: "EUR", name: "Euro" },
      { code: "GBP", name: "British Pound" },
      { code: "AED", name: "UAE Dirham" },
      { code: "CAD", name: "Canadian Dollar" },
      { code: "AUD", name: "Australian Dollar" },
      { code: "JPY", name: "Japanese Yen" },
      { code: "SGD", name: "Singapore Dollar" },
      { code: "CHF", name: "Swiss Franc" }
    ];

    currencies = fallback;

    for (const currency of fallback) {
      const label = `${currencyMeta[currency.code]?.flag || "🌐"} ${currency.code} — ${currency.name}`;
      from.add(new Option(label, currency.code));
      to.add(new Option(label, currency.code));
    }

    from.value = "USD";
    to.value = "INR";

    $("rateStatus").textContent =
      "Using fallback currency list; API currency list unavailable.";
  }
}

function rateFor(from, to) {
  if (from === to) return 1;

  const fromRate = ratesToINR[from];
  const toRate = ratesToINR[to];

  if (!(fromRate > 0) || !(toRate > 0)) return null;

  return fromRate / toRate;
}

function updateConverter() {
  const amount = Number($("amount").value);
  const from = $("fromCurrency").value;
  const to = $("toCurrency").value;
  const rate = rateFor(from, to);

  if ($("amount").value.trim() === "" ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      rate === null) {
    $("result").value = "Unavailable";
    $("conversionNote").textContent =
      "A valid amount and available exchange rate are required.";
    return;
  }

  $("result").value = numberFormat(amount * rate, 4);

  $("conversionNote").textContent =
    `1 ${from} ≈ ${numberFormat(rate, 5)} ${to} · Indicative estimate`;
}

function setRateText(id, code) {
  const element = $(id);
  if (!element) return;

  element.textContent = ratesToINR[code] > 0
    ? moneyFormat(ratesToINR[code], "INR")
    : "Unavailable";
}

function updateRateCards() {
  ["USD", "EUR", "GBP", "AED", "CAD", "AUD"]
    .forEach(code => setRateText(`rate${code}`, code));

  $("heroRate").textContent = ratesToINR.USD > 0
    ? moneyFormat(ratesToINR.USD, "INR")
    : "Unavailable";

  $("heroDate").textContent = lastRateDate || "—";

  $("ratesFootnote").textContent = lastRateDate
    ? `Source: Frankfurter reference data · Rate date: ${lastRateDate}. Values are indicative and may be delayed.`
    : "Reference rate date is unavailable.";
}

async function loadRates() {
  const refresh = $("refreshRates");

  $("rateStatus").textContent = "Fetching reference rates…";
  refresh.disabled = true;

  try {
    if (!currencies.length) {
      await loadCurrencies();
    }

    // Fetch one INR-based reference-rate table instead of making
    // a separate request for every currency.
    const data = await fetchJSON(
      `${API_BASE}/latest?base=INR`
    );

    const nextRates = { INR: 1 };

    for (const [code, value] of Object.entries(data.rates || {})) {
      const numericValue = Number(value);

      if (numericValue > 0 && Number.isFinite(numericValue)) {
        // API value is units of target currency per 1 INR.
        // Store INR per 1 target currency for converter calculations.
        nextRates[code] = 1 / numericValue;
      }
    }

    ratesToINR = nextRates;
    lastRateDate = data.date || null;

    updateRateCards();
    updateConverter();

    $("rateStatus").textContent =
      `Reference rates loaded · ${Object.keys(ratesToINR).length} currencies available`;

    $("updatedAt").textContent =
      `Reference date: ${lastRateDate || "not supplied"} · Checked ${new Date().toLocaleString()}`;

  } catch (error) {
    console.error("Could not load reference rates:", error);

    $("rateStatus").textContent = "Rates unavailable — try again";
    $("updatedAt").textContent =
      "Could not load rates. Check your connection and refresh.";
    $("ratesFootnote").textContent =
      "The reference-rate service could not be reached. Try again later.";

    updateConverter();

  } finally {
    refresh.disabled = false;
  }
}

$("amount").addEventListener("input", updateConverter);
$("fromCurrency").addEventListener("change", updateConverter);
$("toCurrency").addEventListener("change", updateConverter);
$("refreshRates").addEventListener("click", loadRates);

$("swapCurrencies").addEventListener("click", () => {
  const from = $("fromCurrency");
  const to = $("toCurrency");
  const previous = from.value;

  from.value = to.value;
  to.value = previous;

  updateConverter();
});

$("menuToggle").addEventListener("click", () => {
  const nav = $("mainNav");
  const isOpen = nav.classList.toggle("open");

  $("menuToggle").setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => {
    $("mainNav").classList.remove("open");
    $("menuToggle").setAttribute("aria-expanded", "false");
  });
});

$("requestForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("requestName").value.trim();
  const email = $("requestEmail").value.trim();
  const type = $("requestType").value;
  const message = $("requestMessage").value.trim();

  // Replace this placeholder with your real support email.
  const supportEmail = "REPLACE_WITH_YOUR_SUPPORT_EMAIL";

  if (supportEmail.includes("REPLACE_WITH")) {
    $("requestStatus").textContent =
      "Please configure your official support email in script.js before using this form.";
    return;
  }

  const subject = encodeURIComponent(`Exvora enquiry — ${type}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nEnquiry type: ${type}\n\n${message}`
  );

  window.location.href =
    `mailto:${supportEmail}?subject=${subject}&body=${body}`;
});

$("year").textContent = new Date().getFullYear();

(async function initialize() {
  await loadCurrencies();
  await loadRates();
})();
