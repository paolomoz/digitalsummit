/**
 * cards — card grid (block-collection pattern name).
 * Authoring rows:
 *   leading single-cell rows with headings = section head;
 *   card rows: single cell holding the card content (h3 title, optional ps);
 *   trailing single-cell row holding only a link = section CTA row.
 * Variants: tracks (canon tracks-grid of programming-track title cards),
 *   marquetry-br (confetti decoration).
 */
export default async function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';
  const grid = document.createElement('div');
  grid.className = block.classList.contains('tracks') ? 'tracks-grid' : 'cards-grid';
  const foot = document.createElement('div');
  foot.className = 'cta-row';

  rows.forEach((cells) => {
    const cell = cells[0];
    if (!cell) return;
    const heading = cell.querySelector('h3, h4');
    const links = cell.querySelectorAll('a');
    const linkText = [...links].map((a) => a.textContent.trim()).join(' ');
    if (!heading && !grid.children.length) {
      head.append(...cell.childNodes);
      return;
    }
    if (!heading && links.length && linkText.length >= cell.textContent.trim().length * 0.8) {
      foot.append(...cell.childNodes);
      return;
    }
    const card = document.createElement('div');
    card.className = 'ds-card';
    card.append(...cell.childNodes);
    grid.append(card);
  });

  const container = document.createElement('div');
  container.className = 'container';
  if (head.childNodes.length) container.append(head);
  container.append(grid);
  if (foot.childNodes.length) container.append(foot);
  block.replaceChildren(container);
}
