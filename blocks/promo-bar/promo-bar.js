/**
 * promo-bar — indigo promotion strip (countdown attaches in the dynamic
 * phase). Authoring: one row, one cell: message text + CTA link.
 */
export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  const bar = document.createElement('p');
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Promotion');
  if (cell) {
    [...cell.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'P') bar.append(...n.childNodes, ' ');
      else bar.append(n);
    });
  }
  block.replaceChildren(bar);
}
