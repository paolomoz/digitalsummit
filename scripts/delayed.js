// delayed.js — martech, loaded 3s after LCP (dynamic-components.md § 11).
// Container/property IDs carried over from the source site so reporting
// continuity survives the migration (Phase-5 comparative audit).

const GTM_ID = 'GTM-54XRKWW';
const GA4_ID = 'G-BXZY8X74YW';
const HUBSPOT_PORTAL = '49747268';

function loadScript(src, attrs = {}) {
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.append(s);
  return s;
}

// GA4 (gtag)
window.dataLayer = window.dataLayer || [];
function gtag(...args) { window.dataLayer.push(args); }
gtag('js', new Date());
gtag('config', GA4_ID);
loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);

// GTM container
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
loadScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);

// HubSpot tracking (portal 49747268) — tracking + CTAs; entry popups stay
// disabled by design (audit F-003: newsletter is an in-page band, never a
// modal). The forms embed loads lazily from the newsletter block itself.
loadScript(`https://js.hs-scripts.com/${HUBSPOT_PORTAL}.js`, { id: 'hs-script-loader', defer: '' });
