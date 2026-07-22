/**
 * speakers — speaker wall/rail/filter (canon speaker surfaces).
 * Authoring rows:
 *   leading single-cell rows with headings/links = section head;
 *   speaker rows: [headshot image | name link (+ optional meta p)];
 *   trailing single-cell row holding only a link = section CTA row.
 * Variants: (default wall grid) | rail (horizontal scroll) | filter (search).
 */
export default async function decorate(block) {
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
