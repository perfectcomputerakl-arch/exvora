const API_BASE = "https://api.frankfurter.dev/v1";
const currencies = [
  {code:"USD",name:"US Dollar",symbol:"$",flag:"🇺🇸"},
  {code:"INR",name:"Indian Rupee",symbol:"₹",flag:"🇮🇳"},
  {code:"EUR",name:"Euro",symbol:"€",flag:"🇪🇺"},
  {code:"GBP",name:"British Pound",symbol:"£",flag:"🇬🇧"},
  {code:"AED",name:"UAE Dirham",symbol:"د.إ",flag:"🇦🇪"},
  {code:"CAD",name:"Canadian Dollar",symbol:"C$",flag:"🇨🇦"},
  {code:"AUD",name:"Australian Dollar",symbol:"A$",flag:"🇦🇺"},
  {code:"SGD",name:"Singapore Dollar",symbol:"S$",flag:"🇸🇬"},
  {code:"JPY",name:"Japanese Yen",symbol:"¥",flag:"🇯🇵"},
  {code:"CHF",name:"Swiss Franc",symbol:"CHF",flag:"🇨🇭"}
];
let ratesToINR = {INR:1};
let lastRateDate = null;
const $ = id => document.getElementById(id);
const numberFormat = (value, max=2) => new Intl.NumberFormat("en-IN",{maximumFractionDigits:max}).format(value);
const moneyFormat = (value, code) => {
  try { return new Intl.NumberFormat("en-IN",{style:"currency",currency:code,maximumFractionDigits:code==="JPY"?0:2}).format(value); }
  catch { return `${numberFormat(value)} ${code}`; }
};
function fillCurrencySelects(){
  const from=$("fromCurrency"),to=$("toCurrency");
  for(const c of currencies){
    const label=`${c.flag} ${c.code} — ${c.name}`;
    from.add(new Option(label,c.code)); to.add(new Option(label,c.code));
  }
  from.value="USD"; to.value="INR";
}
function rateFor(from,to){
  if(from===to)return 1;
  if(!ratesToINR[from]||!ratesToINR[to])return null;
  return from==="INR" ? 1/ratesToINR[to] : to==="INR" ? ratesToINR[from] : ratesToINR[from]/ratesToINR[to];
}
function updateConverter(){
  const amount=Number($("amount").value),from=$("fromCurrency").value,to=$("toCurrency").value;
  const rate=rateFor(from,to);
  if(!Number.isFinite(amount)||amount<0||rate===null){$("result").value="Unavailable";$("conversionNote").textContent="Rate unavailable for this currency pair.";return;}
  $("result").value=numberFormat(amount*rate,4);
  $("conversionNote").textContent=`1 ${from} ≈ ${numberFormat(rate,5)} ${to} · Indicative estimate`;
}
function setRateText(id,code){
  const el=$(id); if(!el)return;
  el.textContent=ratesToINR[code] ? moneyFormat(ratesToINR[code],"INR") : "Unavailable";
}
function updateRateCards(){
  for(const code of ["USD","EUR","GBP","AED","CAD","AUD"])setRateText(`rate${code}`,code);
  $("heroRate").textContent=ratesToINR.USD ? moneyFormat(ratesToINR.USD,"INR") : "Unavailable";
  $("heroDate").textContent=lastRateDate||"—";
  $("ratesFootnote").textContent=lastRateDate ? `Source: Frankfurter reference data · Rate date: ${lastRateDate}. Values are indicative and may be delayed.` : "Reference rate date is unavailable.";
}
async function loadRates(){
  $("rateStatus").textContent="Fetching reference rates…";
  $("refreshRates").disabled=true;
  try{
    // Fetch one base currency at a time to tolerate currencies that are not supported by the provider.
    const supported={INR:1};
    const results=await Promise.all(currencies.filter(c=>c.code!=="INR").map(async c=>{
      try{
        const response=await fetch(`${API_BASE}/latest?base=${encodeURIComponent(c.code)}&symbols=INR`,{cache:"no-store"});
        if(!response.ok)throw new Error("Unsupported");
        const data=await response.json();
        const value=Number(data.rates?.INR);
        if(value>0)return {code:c.code,value,date:data.date};
      }catch(_){return null;}
      return null;
    }));
    let dates=[];
    for(const item of results){if(item){supported[item.code]=item.value;dates.push(item.date);}}
    ratesToINR=supported;
    lastRateDate=dates.sort().pop()||null;
    updateRateCards();updateConverter();
    const available=Object.keys(ratesToINR).length;
    $("rateStatus").textContent=`Reference rates loaded · ${available} currencies available`;
    $("updatedAt").textContent=`Reference data date: ${lastRateDate||"not supplied"} · Checked ${new Date().toLocaleString()}`;
  }catch(error){
    $("rateStatus").textContent="Rates unavailable — try again";
    $("updatedAt").textContent="Could not load rates. Check your internet connection and refresh.";
    $("ratesFootnote").textContent="The rate service could not be reached. Try refreshing later.";
    updateConverter();
  }finally{$("refreshRates").disabled=false;}
}
$("amount").addEventListener("input",updateConverter);
$("fromCurrency").addEventListener("change",updateConverter);
$("toCurrency").addEventListener("change",updateConverter);
$("refreshRates").addEventListener("click",loadRates);
$("swapCurrencies").addEventListener("click",()=>{
  const from=$("fromCurrency"),to=$("toCurrency"),old=from.value;
  from.value=to.value;to.value=old;updateConverter();
});
$("menuToggle").addEventListener("click",()=>{
  const nav=$("mainNav"),open=nav.classList.toggle("open");
  $("menuToggle").setAttribute("aria-expanded",String(open));
});
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>{
  $("mainNav").classList.remove("open");$("menuToggle").setAttribute("aria-expanded","false");
}));
$("requestForm").addEventListener("submit",event=>{
  event.preventDefault();
  const name=$("requestName").value.trim(),email=$("requestEmail").value.trim();
  const type=$("requestType").value,message=$("requestMessage").value.trim();
  // Replace this placeholder with an email address you control before using the form.
  const supportEmail="REPLACE_WITH_YOUR_SUPPORT_EMAIL";
  if(supportEmail.includes("REPLACE_WITH")){
    $("requestStatus").textContent="Demo mode: open script.js and replace REPLACE_WITH_YOUR_SUPPORT_EMAIL with your official support email before using this form.";
    return;
  }
  const subject=encodeURIComponent(`Exvora enquiry — ${type}`);
  const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\nEnquiry type: ${type}\n\n${message}`);
  window.location.href=`mailto:${supportEmail}?subject=${subject}&body=${body}`;
});
$("year").textContent=new Date().getFullYear();
fillCurrencySelects();
loadRates();
