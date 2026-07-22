/**
 * event-cards — hub roster of upcoming events (canon event-cards-grid).
 * Authoring rows:
 *   leading single-cell rows with h2/lede = section head;
 *   card rows: [image | body (optional eyebrow p, <h3> city, dates p, CTA ps)];
 *   trailing single-cell row holding only links = section CTA row;
 *   OR sheet mode: a row with a single link to events.json renders the
 *   upcoming roster (event lifecycle: past events drop off automatically,
 *   the soonest event is flagged "Next Event").
 */
import { fetchSheet, readSheetConfig, sheetImg } from '../../scripts/sheet.js';

function rowFromEvent(ev, isNext) {
  const row = document.createElement('div');
  const imgCell = document.createElement('div');
  if (ev.image) imgCell.append(sheetImg(ev.image, ev.name));
  const body = document.createElement('div');
  if (isNext) {
    const eyebrow = document.createElement('p');
    eyebrow.textContent = 'Next Event';
    body.append(eyebrow);
  }
  const h = document.createElement('h3');
  h.textContent = ev.name;
  body.append(h);
  const dates = document.createElement('p');
  dates.textContent = [ev.location, ev.dates].filter(Boolean).join(' | ');
  body.append(dates);
  if (ev.path) {
    const p = document.createElement('p');
    const em = document.createElement('em');
    const a = document.createElement('a');
    a.href = ev.path;
    a.textContent = `Visit ${ev.shortName || ev.name}`;
    em.append(a);
    p.append(em);
    body.append(p);
  }
  if (ev.registration) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = ev.registration;
    a.textContent = 'Register Now';
    p.append(a);
    body.append(p);
  }
  row.append(imgCell, body);
  return row;
}

function isLinkOnly(cell) {
  const links = cell.querySelectorAll('a');
  return links.length > 0 && cell.textContent.trim()
    && [...links].map((a) => a.textContent.trim()).join(' ').length >= cell.textContent.trim().length * 0.8;
}

export default async function decorate(block) {
  const sheet = readSheetConfig(block);
  if (sheet) {
    const data = await fetchSheet(sheet.url);
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = data
      .filter((ev) => ev.name && (ev.endDate || '') >= today)
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
    const last = block.lastElementChild;
    const ctaRow = last && last.children.length === 1 && last.querySelector('a')
      && !last.querySelector('picture, img') ? last : null;
    upcoming.forEach((ev, i) => {
      const row = rowFromEvent(ev, i === 0);
      if (ctaRow) block.insertBefore(row, ctaRow);
      else block.append(row);
    });
  }
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';
  const grid = document.createElement('div');
  grid.className = 'event-cards-grid';
  const foot = document.createElement('div');
  foot.className = 'cta-row';

  rows.forEach((cells) => {
    if (cells.length === 1 && !cells[0].querySelector('picture, img')) {
      const cell = cells[0];
      if (grid.children.length && isLinkOnly(cell)) {
        cell.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
        foot.append(...cell.childNodes);
      } else {
        head.append(...cell.childNodes);
      }
      return;
    }
    const card = document.createElement('article');
    card.className = 'ds-card event-card';
    const imgCell = cells.find((c) => c.querySelector('picture, img'));
    const bodyCell = cells.find((c) => c !== imgCell);
    if (imgCell) {
      const pic = imgCell.querySelector('picture, img');
      card.append(pic.tagName === 'IMG' ? (pic.closest('picture') || pic) : pic);
    }
    const body = document.createElement('div');
    body.className = 'event-card-body';
    if (bodyCell) {
      const h = bodyCell.querySelector('h3, h4, h2');
      const ps = [...bodyCell.querySelectorAll('p')];
      const ctas = ps.filter((p) => p.querySelector('a'));
      const texts = ps.filter((p) => !p.querySelector('a'));
      texts.forEach((p) => {
        // eslint-disable-next-line no-bitwise
        if (h && (h.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING)) {
          p.className = 't-eyebrow';
          body.append(p);
        }
      });
      if (h) body.append(h);
      texts.forEach((p) => {
        if (!p.parentElement || p.parentElement !== body) {
          p.className = 'event-dates';
          body.append(p);
        }
      });
      if (ctas.length) {
        const row = document.createElement('div');
        row.className = 'cta-row';
        ctas.forEach((p) => {
          p.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
          row.append(p);
        });
        body.append(row);
      }
    }
    card.append(body);
    grid.append(card);
  });

  const container = document.createElement('div');
  container.className = 'container';
  if (head.childNodes.length) container.append(head);
  container.append(grid);
  if (foot.childNodes.length) container.append(foot);
  block.replaceChildren(container);
}
