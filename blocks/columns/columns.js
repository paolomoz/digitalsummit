/**
 * columns — two-column prose / split-media (canon two-col + split-media).
 * Authoring rows:
 *   leading single-cell rows with headings = section head;
 *   a two-cell row = the columns (a cell holding an image makes the row
 *   a centered split-media; text-only cells make a top-aligned two-col).
 * Variants: prose (rich text h3/list styling).
 */
export default async function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);
  const head = document.createElement('div');
  head.className = 'section-head';
  const container = document.createElement('div');
  container.className = 'container';

  rows.forEach((cells) => {
    if (cells.length === 1) {
      head.append(...cells[0].childNodes);
      return;
    }
    const hasImg = cells.some((c) => c.querySelector('picture, img'));
    const wrap = document.createElement('div');
    wrap.className = hasImg ? 'split-media' : 'two-col';
    cells.forEach((cell) => {
      const col = document.createElement('div');
      col.append(...cell.childNodes);
      col.querySelectorAll('a:not(.button)').forEach((a) => a.classList.add('ds-link'));
      wrap.append(col);
    });
    container.append(wrap);
  });

  if (head.childNodes.length) container.prepend(head);
  block.replaceChildren(container);
}
