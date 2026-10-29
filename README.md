# Exvora — Professional Currency Tools

A responsive static website starter for Exvora, with a currency converter, indicative reference rates, popular rate cards, contact form demo, and sign-in placeholder.

## Deploy on GitHub Pages

1. Create a new public repository named `exvora` (or another name you choose).
2. Upload `index.html`, `styles.css`, `script.js`, `README.md`, and the `assets/` folder to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for GitHub Pages to publish the site.

## Before launch

- Confirm the Exvora name and domain/trademark availability; this starter does not establish that the name is legally available.
- Replace `REPLACE_WITH_YOUR_SUPPORT_EMAIL` in `script.js` with a verified support address.
- Test the reference-rate API in your target browsers and decide on a reliable rate provider and applicable usage terms.
- Add a privacy notice, terms, accessibility checks, error monitoring, and a secure backend before collecting real customer information.
- The login dialog is a placeholder only. It does not authenticate users or store accounts.
- The contact form uses a `mailto:` link and does not submit information to a server.
- No money transfer, currency purchase/sale, payment collection, or forex transaction is implemented.

## Rates

The converter requests reference rates from the public Frankfurter API. The API may not update on weekends/holidays, and these are indicative reference values, not guaranteed tradeable rates. If the API is unavailable, the page displays an error rather than inventing a rate.

## Important regulatory note

This is an informational demo, not a bank, authorised dealer, money changer, remittance provider, or financial adviser. Do not offer or execute foreign-exchange transactions until you have confirmed the applicable RBI/FEMA requirements and established an appropriate authorised-partner or licensing arrangement. A static GitHub Pages site is not suitable for storing passwords, identity documents, payment details, or other sensitive customer information.
