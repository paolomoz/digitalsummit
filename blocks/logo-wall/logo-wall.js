/**
 * logo-wall — partner/attendee logo surfaces.
 * Authoring rows:
 *   leading single-cell rows with headings/CTAs = section head;
 *   logo rows: one image per row (alt = brand name).
 * Variants: (default tile wall) | strip (flat centered strip of wide images).
 */
export default async function decorate(block) {
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
  container.append(wall);
  block.replaceChildren(container);
}
