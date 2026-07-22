/**
 * quotes — testimonial band over a photo with indigo scrim (canon
 * testimonial-band). Authoring rows (single cell):
 *   optional background image row | one quote per row.
 */
export default async function decorate(block) {
  const pic = block.querySelector('picture, img');
  if (pic) {
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img && img.src) block.style.backgroundImage = `url('${img.src}')`;
    const row = pic.closest('.quotes > div');
    if (row) row.remove();
  }

  const container = document.createElement('div');
  container.className = 'container';
  const quotesEl = document.createElement('div');
  quotesEl.className = 'quotes-grid';
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    if (!text) return;
    const bq = document.createElement('blockquote');
    bq.textContent = text;
    quotesEl.append(bq);
  });
  container.append(quotesEl);
  block.replaceChildren(container);
}
