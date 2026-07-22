/**
 * speakers — speaker wall/rail/filter (canon speaker surfaces).
 * Authoring rows:
 *   leading single-cell rows with headings/links = section head;
 *   speaker rows: [headshot image | name link (+ optional meta p)];
 *   trailing single-cell row holding only a link = section CTA row;
 *   OR sheet mode: a row with a single link to speakers.json (+ optional
 *   city cell) pulls the roster from the sheet (dynamic phase).
 * Variants: (default wall grid) | rail (horizontal scroll) | filter (search).
 */
import { fetchSheet, readSheetConfig, sheetImg } from '../../scripts/sheet.js';

function rowFromSpeaker(s) {
  const row = document.createElement('div');
  const imgCell = document.createElement('div');
  if (s.image) imgCell.append(sheetImg(s.image, s.name, 140, 140));
  const body = document.createElement('div');
  const p = document.createElement('p');
  if (s.href) {
    const a = document.createElement('a');
    a.href = s.href;
    a.textContent = s.name;
    p.append(a);
  } else {
    const strong = document.createElement('strong');
    strong.textContent = s.name;
    p.append(strong);
  }
  body.append(p);
  const meta = [s.title, s.company].filter(Boolean).join(', ');
  if (meta) {
    const mp = document.createElement('p');
    mp.textContent = meta;
    body.append(mp);
  }
  row.append(imgCell, body);
  return row;
}

export default async function decorate(block) {
  const sheet = readSheetConfig(block);
  if (sheet) {
    const data = await fetchSheet(sheet.url);
    const roster = sheet.scope ? data.filter((r) => (r.city || '').toLowerCase() === sheet.scope) : data;
    // insert before a trailing CTA row (if any) so head/CTA rows keep meaning
    const last = block.lastElementChild;
    const ctaRow = last && last.children.length === 1 && last.querySelector('a')
      && !last.querySelector('picture, img') ? last : null;
    roster.forEach((s) => {
      if (ctaRow) block.insertBefore(rowFromSpeaker(s), ctaRow);
      else block.append(rowFromSpeaker(s));
    });
  }
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';
  const isRail = block.classList.contains('rail');
  const list = document.createElement('div');
  list.className = isRail ? 'speaker-rail' : 'speaker-grid';
  if (isRail) {
    list.setAttribute('tabindex', '0');
    list.setAttribute('aria-label', 'Featured speakers — scroll horizontally');
  }
  const foot = document.createElement('div');
  foot.className = 'cta-row';

  rows.forEach((cells) => {
    const hasImg = cells.some((c) => c.querySelector('picture, img'));
    if (!hasImg && cells.length === 1) {
      const cell = cells[0];
      const links = cell.querySelectorAll('a');
      const linkText = [...links].map((a) => a.textContent.trim()).join(' ');
      const linkOnly = links.length
        && linkText.length >= cell.textContent.trim().length * 0.8;
      if (list.children.length && linkOnly) {
        foot.append(...cell.childNodes);
      } else {
        cell.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
        head.append(...cell.childNodes);
      }
      return;
    }
    const card = document.createElement('div');
    card.className = 'speaker-card';
    const imgCell = cells.find((c) => c.querySelector('picture, img'));
    if (!imgCell) {
      const ph = document.createElement('span');
      ph.className = 'ds-avatar placeholder';
      ph.title = 'Headshot not captured';
      card.append(ph);
    }
    if (imgCell) {
      const pic = imgCell.querySelector('picture, img');
      const wrapper = pic.tagName === 'IMG' ? (pic.closest('picture') || pic) : pic;
      const img = wrapper.tagName === 'IMG' ? wrapper : wrapper.querySelector('img');
      if (img) {
        img.classList.add('ds-avatar');
        img.width = 140;
        img.height = 140;
      }
      card.append(wrapper);
    }
    const bodyCell = cells.find((c) => c !== imgCell && c.querySelector('a'));
    if (bodyCell) {
      const a = bodyCell.querySelector('a');
      a.className = 'speaker-name';
      card.append(a);
      const meta = document.createElement('p');
      meta.className = 'speaker-meta';
      const metaText = [...bodyCell.querySelectorAll('p')]
        .map((p) => p.textContent.trim())
        .filter((t) => t && t !== a.textContent.trim());
      meta.textContent = metaText.join(' ');
      card.append(meta);
    }
    list.append(card);
  });

  const container = document.createElement('div');
  container.className = 'container';
  if (head.childNodes.length) container.append(head);

  if (block.classList.contains('filter')) {
    const form = document.createElement('form');
    form.className = 'filter-bar';
    form.setAttribute('role', 'search');
    form.addEventListener('submit', (e) => e.preventDefault());
    const label = document.createElement('label');
    label.className = 'visually-hidden';
    label.setAttribute('for', 'speaker-search');
    label.textContent = 'Search speakers';
    const input = document.createElement('input');
    input.type = 'search';
    input.id = 'speaker-search';
    input.name = 'q';
    input.placeholder = 'Search speakers by name, company, or topic';
    input.autocomplete = 'off';
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      list.querySelectorAll('.speaker-card').forEach((card) => {
        card.style.display = !q || card.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    form.append(label, input);
    container.append(form);
  }

  container.append(list);
  if (foot.childNodes.length) container.append(foot);
  block.replaceChildren(container);
}
