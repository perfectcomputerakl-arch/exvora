# Exvora — Global Currency Tools

Responsive static website for indicative currency conversion, exchange-rate snapshots, currency facts, and email-based enquiries.

## Files
- `index.html` — page structure and content
- `styles.css` — responsive styling
- `script.js` — converter, reference-rate loading, menu and enquiry form
- `assets/favicon.svg` — browser icon

## Publish on GitHub Pages
1. Extract this ZIP on your phone/computer.
2. Open your `exvora` repository on GitHub.
3. Choose **Add file → Upload files**.
4. Upload the contents of this folder (not the ZIP itself), including `index.html`, `styles.css`, `script.js`, and the `assets` folder.
5. Commit changes to the `main` branch. Keep files in the repository root.
6. In **Settings → Pages**, select **Deploy from a branch**, branch `main`, folder `/(root)`. Save if needed.
7. Wait a few minutes and refresh your published site.

## Before using the enquiry form
In `script.js`, replace `REPLACE_WITH_YOUR_SUPPORT_EMAIL` with an email address you control. The form uses the visitor's email app (`mailto:`); it does not send data to a server.

## Important limitations
- This is a static informational website, not a bank, money changer, remittance provider or payment service.
- It does not collect funds, trade currencies, or execute transfers.
- Reference rates can be delayed, unavailable or different from rates offered by financial providers.
- Any real money-changing/remittance service must be set up through an appropriately authorised arrangement and comply with applicable RBI/FEMA/KYC/AML and other requirements.
- Do not add API secrets, passwords, private customer information or financial credentials to this public repository.
