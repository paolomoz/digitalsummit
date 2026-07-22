/**
 * logo-wall — partner/attendee logo surfaces.
 * Authoring rows:
 *   leading single-cell rows with headings/CTAs = section head;
 *   logo rows: one image per row (alt = brand name);
 *   OR sheet mode: a row with a single link to partners.json (+ optional
 *   city cell) renders the partner wall, grouped by tier when present.
 * Variants: (default tile wall) | strip (flat centered strip of wide images).
 */
import { fetchSheet, readSheetConfig, sheetImg } from '../../scripts/sheet.js';

export default async function decorate(block) {
  const sheet = readSheetConfig(block);
  let sheetPartners = null;
  if (sheet) {
    const data = await fetchSheet(sheet.url);
    sheetPartners = sheet.scope ? data.filter((r) => (r.city || '').toLowerCase() === sheet.scope) : data;
  }
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';
  const isStrip = block.classList.contains('strip');
  const wall = document.createElement('div');
  wall.className = isStrip ? 'logo-strip' : 'logo-wall';

  rows.forEach((cells) => {
    cells.forEach((cell) => {
      const pics = [...cell.querySelectorAll('picture, img')]
        .filter((el) => el.tagName === 'PICTURE' || !el.closest('picture'));
      if (!pics.length) {
        const ctas = [...cell.querySelectorAll('p')].filter((p) => p.querySelector('a'));
        const rest = [...cell.childNodes].filter((n) => !ctas.includes(n));
        head.append(...rest);
        if (ctas.length) {
          const row = document.createElement('div');
          row.className = 'cta-row';
          row.append(...ctas);
          head.append(row);
        }
        return;
      }
      pics.forEach((pic) => {
        const wrapper = pic.tagName === 'IMG' ? (pic.closest('picture') || pic) : pic;
        if (isStrip) {
          wall.append(wrapper);
        } else {
          const tile = document.createElement('div');
          tile.className = 'logo-tile';
          tile.append(wrapper);
          wall.append(tile);
        }
      });
    });
  });

  const container = document.createElement('div');
  container.className = 'container';
  if (head.childNodes.length) container.append(head);
  if (sheetPartners && sheetPartners.length) {
    const tiers = [...new Set(sheetPartners.map((p) => p.tier || ''))];
    tiers.forEach((tier) => {
      if (tier) {
        const h = document.createElement('h3');
        h.className = 'tier-heading';
        h.textContent = tier;
        container.append(h);
      }
      const tierWall = document.createElement('div');
      tierWall.className = 'logo-wall';
      sheetPartners.filter((p) => (p.tier || '') === tier).forEach((p) => {
        const img = sheetImg(p.logo, p.name);
        const tile = document.createElement('div');
        tile.className = 'logo-tile';
        if (p.href) {
          const a = document.createElement('a');
          a.href = p.href;
          a.setAttribute('aria-label', p.name || 'Partner');
          a.append(img);
          tile.append(a);
        } else {
          tile.append(img);
        }
        tierWall.append(tile);
      });
      container.append(tierWall);
    });
    if (wall.childNodes.length) container.append(wall);
  } else {
    container.append(wall);
  }
  block.replaceChildren(container);
}
