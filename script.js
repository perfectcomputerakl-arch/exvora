"use strict";

// EXVORA — Global Currency Tools
// Uses Frankfurter API v2
const API_BASE = "https://api.frankfurter.dev/v2";

const $ = (id) => document.getElementById(id);

let currencies = [];
let ratesToINR = { INR: 1 };
let lastRateDate = null;

// Currency code to flag
const currencyFlags = {
  AFN: "🇦🇫",
  AED: "🇦🇪",
  AUD: "🇦🇺",
  BDT: "🇧🇩",
  BHD: "🇧🇭",
  BRL: "🇧🇷",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  DKK: "🇩🇰",
  EGP: "🇪🇬",
  EUR: "🇪🇺",
  FJD: "🇫🇯",
  GBP: "🇬🇧",
  HKD: "🇭🇰",
  IDR: "🇮🇩",
  ILS: "🇮🇱",
  INR: "🇮🇳",
  IQD: "🇮🇶",
  IRR: "🇮🇷",
  JOD: "🇯🇴",
  JPY: "🇯🇵",
  KES: "🇰🇪",
  KRW: "🇰🇷",
  KWD: "🇰🇼",
  LKR: "🇱🇰",
  MAD: "🇲🇦",
  MUR: "🇲🇺",
  MXN: "🇲🇽",
  MYR: "🇲🇾",
  NGN: "🇳🇬",
  NPR: "🇳🇵",
  NZD: "🇳🇿",
  OMR: "🇴🇲",
  PHP: "🇵🇭",
  PKR: "🇵🇰",
  QAR: "🇶🇦",
  RUB: "🇷🇺",
  SAR: "🇸🇦",
  SEK: "🇸🇪",
  SGD: "🇸🇬",
  THB: "🇹🇭",
  TRY: "🇹🇷",
  TWD: "🇹🇼",
  USD: "🇺🇸",
  VND: "🇻🇳",
  ZAR: "🇿🇦"
};

function numberFormat(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits
  }).format(value);
}

function moneyFormat(value, code) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: ["JPY", "KRW", "VND"].includes(code)
        ? 0
        : 2
    }).format(value);
  } catch {
    return `${numberFormat(value)} ${code}`;
  }
}

async function fetchJSON(url) {
  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

// Load the currencies supported by the API.
async function loadCurrencies() {
  try {
    const data = await fetchJSON(`${API_BASE}/currencies`);

    currencies = data
      .filter(item => item.iso_code && item.name)
      .map(item => ({
        code: item.iso_code.toUpperCase(),
        name: item.name,
        symbol: item.symbol || item.iso_code
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    if (!currencies.some(c => c.code === "INR")) {
      currencies.push({
        code: "INR",
        name: "Indian Rupee",
        symbol: "₹"
      });
    }

    fillCurrencySelects();

    return true;
  } catch (error) {
    console.error("Currency list could not load:", error);

    // Fallback list if the currency catalogue is temporarily unavailable.
    currencies = [
      { code: "INR", name: "Indian Rupee", symbol: "₹" },
      { code: "USD", name: "US Dollar", symbol: "$" },
      { code: "EUR", name: "Euro", symbol: "€" },
      { code: "GBP", name: "British Pound", symbol: "£" },
      { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
      { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
      { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
      { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
      { code: "FJD", name: "Fijian Dollar", symbol: "$" },
      { code: "CAD", name: "Canadian Dollar", symbol: "$" },
      { code: "AUD", name: "Australian Dollar", symbol: "$" },
      { code: "JPY", name: "Japanese Yen", symbol: "¥" },
      { code: "SGD", name: "Singapore Dollar", symbol: "$" },
      { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
      { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
      { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
      { code: "NPR", name: "Nepalese Rupee", symbol: "रू" }
    ];

    fillCurrencySelects();
    return false;
  }
}

function fillCurrencySelects() {
  const from = $("fromCurrency");
  const to = $("toCurrency");

  if (!from || !to) return;

  from.replaceChildren();
  to.replaceChildren();

  for (const currency of currencies) {
    const flag = currencyFlags[currency.code] || "🌐";
    const label = `${flag} ${currency.code} — ${currency.name}`;

    from.add(new Option(label, currency.code));
    to.add(new Option(label, currency.code));
  }

  from.value = currencies.some(c => c.code === "USD")
    ? "USD"
    : "INR";

  to.value = "INR";
}

// ratesToINR stores the INR value of one unit of each currency.
function rateFor(from, to) {
  if (from === to) return 1;

  const fromRate = ratesToINR[from];
  const toRate = ratesToINR[to];

  if (
    !Number.isFinite(fromRate) ||
    !Number.isFinite(toRate) ||
    fromRate <= 0 ||
    toRate <= 0
  ) {
    return null;
  }

  return fromRate / toRate;
}

function updateConverter() {
  const amountElement = $("amount");
  const resultElement = $("result");
  const noteElement = $("conversionNote");

  if (!amountElement || !resultElement) return;

  const amount = Number(amountElement.value);
  const from = $("fromCurrency")?.value;
  const to = $("toCurrency")?.value;

  const rate = rateFor(from, to);

  if (!Number.isFinite(amount) || amount < 0) {
    resultElement.value = "Enter a valid amount";
    if (noteElement) {
      noteElement.textContent = "Please enter zero or a positive amount.";
    }
    return;
  }

  if (rate === null) {
    resultElement.value = "Rate unavailable";

    if (noteElement) {
      noteElement.textContent =
        `The ${from} to ${to} exchange rate is not available.`;
    }
    return;
  }

  resultElement.value = numberFormat(amount * rate, 4);

  if (noteElement) {
    noteElement.textContent =
      `1 ${from} ≈ ${numberFormat(rate, 6)} ${to} · Indicative reference rate`;
  }
}

function setRateText(id, code) {
  const element = $(id);
  if (!element) return;

  const value = ratesToINR[code];

  element.textContent = Number.isFinite(value)
    ? moneyFormat(value, "INR")
    : "Unavailable";
}

function updateRateCards() {
  for (const code of ["USD", "EUR", "GBP", "AED", "CAD", "AUD"]) {
    setRateText(`rate${code}`, code);
  }

  const heroRate = $("heroRate");
  if (heroRate) {
    heroRate.textContent = Number.isFinite(ratesToINR.USD)
      ? moneyFormat(ratesToINR.USD, "INR")
      : "Unavailable";
  }

  if ($("heroDate")) {
    $("heroDate").textContent = lastRateDate || "—";
  }

  if ($("ratesFootnote")) {
    $("ratesFootnote").textContent = lastRateDate
      ? `Source: Frankfurter API · Reference rate date: ${lastRateDate}. Rates may be delayed and are not guaranteed transaction prices.`
      : "Reference exchange rate date is unavailable.";
  }
}

// Load exchange rates for INR and calculate INR value per currency.
async function loadRates() {
  const status = $("rateStatus");
  const refreshButton = $("refreshRates");

  if (status) status.textContent = "Loading currencies and reference rates…";
  if (refreshButton) refreshButton.disabled = true;

  try {
    if (currencies.length === 0) {
      await loadCurrencies();
    }

    const data = await fetchJSON(`${API_BASE}/rates?base=INR`);

    if (!Array.isArray(data)) {
      throw new Error("Unexpected rates response");
    }

    const newRates = { INR: 1 };
    const dates = [];

    for (const item of data) {
      const quote = String(item.quote || "").toUpperCase();
      const rate = Number(item.rate);

      // With INR as the base, the quote rate means foreign currency
      // units per 1 INR. Invert it to obtain INR per 1 foreign unit.
      if (quote && rate > 0 && Number.isFinite(rate)) {
        newRates[quote] = 1 / rate;
        if (item.date) dates.push(item.date);
      }
    }

    ratesToINR = newRates;
    lastRateDate = dates.sort().pop() || null;

    updateRateCards();
    updateConverter();

    const available = Object.keys(ratesToINR).length;

    if (status) {
      status.textContent =
        `Reference rates loaded · ${available} currencies with rates`;
    }

    if ($("updatedAt")) {
      $("updatedAt").textContent =
        `Reference data date: ${lastRateDate || "not supplied"} · Checked ${new Date().toLocaleString()}`;
    }
  } catch (error) {
    console.error("Exchange rates could not load:", error);

    if (status) {
      status.textContent = "Rates unavailable — check your internet and retry.";
    }

    if ($("updatedAt")) {
      $("updatedAt").textContent =
        "Could not load exchange rates. Please try refreshing.";
    }

    if ($("ratesFootnote")) {
      $("ratesFootnote").textContent =
        "The exchange-rate service could not be reached. Try again later.";
    }

    updateConverter();
  } finally {
    if (refreshButton) refreshButton.disabled = false;
  }
}

// Converter controls
$("amount")?.addEventListener("input", updateConverter);
$("fromCurrency")?.addEventListener("change", updateConverter);
$("toCurrency")?.addEventListener("change", updateConverter);

$("refreshRates")?.addEventListener("click", loadRates);

$("swapCurrencies")?.addEventListener("click", () => {
  const from = $("fromCurrency");
  const to = $("toCurrency");

  if (!from || !to) return;

  const oldFrom = from.value;
  from.value = to.value;
  to.value = oldFrom;

  updateConverter();
});

// Mobile navigation
$("menuToggle")?.addEventListener("click", () => {
  const nav = $("mainNav");
  const button = $("menuToggle");

  if (!nav || !button) return;

  const isOpen = nav.classList.toggle("open");
  button.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => {
    $("mainNav")?.classList.remove("open");
    $("menuToggle")?.setAttribute("aria-expanded", "false");
  });
});

// Enquiry form
$("requestForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("requestName")?.value.trim() || "";
  const email = $("requestEmail")?.value.trim() || "";
  const type = $("requestType")?.value || "General enquiry";
  const message = $("requestMessage")?.value.trim() || "";

  const status = $("requestStatus");

  // Replace this placeholder with your actual support email.
  const supportEmail = "REPLACE_WITH_YOUR_SUPPORT_EMAIL";

  if (!name || !email || !message) {
    if (status) {
      status.textContent = "Please complete all required fields.";
    }
    return;
  }

  if (supportEmail.includes("REPLACE_WITH")) {
    if (status) {
      status.textContent =
        "The enquiry form is in demo mode. Configure your official support email in script.js first.";
    }
    return;
  }

  const subject = encodeURIComponent(`Exvora enquiry — ${type}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nEnquiry type: ${type}\n\n${message}`
  );

  window.location.href =
    `mailto:${supportEmail}?subject=${subject}&body=${body}`;
});

// Footer year
if ($("year")) {
  $("year").textContent = new Date().getFullYear();
}

// Start the application
(async function init() {
  await loadCurrencies();
  await loadRates();
})();
