import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.13-2.45-.13-2.4 0-4.05 1.47-4.05 4.17v2.33H7.5V13h2.7v8h3.3z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.3c2.5 0 2.8 0 3.8.06 2.5.11 3.7 1.32 3.8 3.8.05 1 .06 1.3.06 3.84s0 2.84-.06 3.84c-.11 2.48-1.3 3.7-3.8 3.8-1 .05-1.3.06-3.8.06s-2.8 0-3.8-.06c-2.5-.1-3.7-1.32-3.8-3.8-.05-1-.06-1.3-.06-3.84s0-2.84.06-3.84c.11-2.48 1.3-3.7 3.8-3.8 1-.05 1.3-.06 3.8-.06zM12 2.4c-2.6 0-2.9.01-3.9.06C4.7 2.62 2.8 4.5 2.64 7.9c-.05 1-.06 1.34-.06 3.94s.01 2.93.06 3.95c.16 3.4 2.05 5.28 5.46 5.44 1 .05 1.3.06 3.9.06s2.9-.01 3.9-.06c3.4-.16 5.3-2.04 5.46-5.44.05-1.02.06-1.35.06-3.95s-.01-2.93-.06-3.94C21.2 4.5 19.3 2.62 15.9 2.46c-1-.05-1.3-.06-3.9-.06zm0 4.7a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.1-9.4a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.6H3.6V21h3.34V8.6zM5.27 7.17a1.94 1.94 0 1 0 0-3.87 1.94 1.94 0 0 0 0 3.87zM21 14.2c0-3.2-1.7-4.7-4-4.7-1.85 0-2.68 1.02-3.14 1.73V8.6h-3.35c.04.95 0 12.4 0 12.4h3.35v-6.93c0-.37.03-.74.14-1 .24-.6.8-1.23 1.72-1.23 1.22 0 1.93.93 1.93 2.3V21H21v-6.8z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>',
};

/**
 * footer — Digital Summit canon chrome (template-slotted).
 * /footer contract, five sections in order:
 *   1. contact prose (headings authored as <strong> lead lines)
 *   2. "Digital Summit Events" heading + city link list
 *   3. "General Info" heading + link list
 *   4. brand: "Connect with us! #DigitalSummit" + social link list
 *   5. legal line ("© 2026 … | Privacy Policy | Code of Conduct")
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const roles = ['contact', 'events', 'general', 'brand', 'legal'];
  const sections = [...footer.children];
  sections.forEach((section, i) => {
    if (roles[i]) section.classList.add(`footer-${roles[i]}`);
  });

  // grid wraps the first four columns; legal sits below
  const grid = document.createElement('div');
  grid.className = 'footer-grid';
  sections.slice(0, 4).forEach((s) => grid.append(s));
  footer.prepend(grid);

  // brand column: fixed white logo + social icons
  const brand = footer.querySelector('.footer-brand');
  if (brand) {
    const logo = document.createElement('img');
    logo.src = '/img/logo-white.svg';
    logo.alt = 'Digital Summit';
    logo.width = 300;
    logo.height = 49;
    logo.loading = 'lazy';
    const wrapper = brand.querySelector('.default-content-wrapper') || brand;
    wrapper.prepend(logo);
    const social = wrapper.querySelector('ul');
    if (social) {
      social.className = 'social-row';
      social.querySelectorAll('a').forEach((a) => {
        const label = a.textContent.trim().toLowerCase();
        const icon = SOCIAL_ICONS[label];
        if (icon) {
          a.setAttribute('aria-label', `Digital Summit on ${a.textContent.trim()}`);
          a.innerHTML = icon;
        }
      });
    }
  }

  block.append(footer);
}
